import { EnvironmentVariables } from '@config/env/environment-variables.config';
import { CompanyService } from '@modules/company/company.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus, Prisma, User } from '@prisma/client';
import Stripe from 'stripe';
import { ConnectStripeResponseDto } from './dto/connect-stripe-response.dto';

@Injectable()
export class StripeService {
	private stripe: Stripe;

	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService<EnvironmentVariables, true>,
		@Inject(forwardRef(() => CompanyService))
		private readonly companyService: CompanyService
	) {
		this.stripe = new Stripe(
			this.configService.get<string>('STRIPE_SECRET_KEY')
		);
	}

	async getStripeConnectUrl(
		companyId: number,
		user: User
	): Promise<ConnectStripeResponseDto> {
		await this.companyService.checkIsCompanyAdmin(user.id, companyId);

		const redirectUri = `${this.configService.get<string>('APP_URL')}/api/v1/payments/stripe-callback`;
		const stripeClientId = this.configService.get<string>('STRIPE_CLIENT_ID');
		const stripeConnectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${stripeClientId}&scope=read_write&redirect_uri=${redirectUri}&state=${companyId}`;

		return { url: stripeConnectUrl };
	}

	async handleStripeOAuthCallback(
		code: string,
		companyId: number
	): Promise<void> {
		try {
			const response = await this.stripe.oauth.token({
				grant_type: 'authorization_code',
				code,
			});
			const stripeAccountId = response.stripe_user_id;

			await this.prisma.company.update({
				where: {
					id: companyId,
				},
				data: {
					stripeAccountId,
				},
			});
		} catch {
			throw new BadRequestException('Failed to connect Stripe account');
		}
	}

	async createPaymentIntent(
		itemTitle: string,
		itemPrice: Prisma.Decimal,
		itemQuantity: number,
		metadata?: Stripe.Metadata
	): Promise<Stripe.PaymentIntent & { client_secret: string }> {
		const company = await this.companyService.findById(
			Number(metadata?.companyId)
		);

		if (!company?.stripeAccountId) {
			// TODO: add check for stripe account id before creating event
			throw new BadRequestException(
				'Company does not have a connected Stripe account'
			);
		}

		const paymentIntent = await this.stripe.paymentIntents.create({
			amount: itemPrice.mul(itemQuantity).mul(100).round().toNumber(),
			currency: 'usd',
			payment_method_types: ['card'],
			transfer_data: {
				destination: company.stripeAccountId,
			},
			metadata,
		});

		if (!paymentIntent.client_secret) {
			throw new Error('Failed to create Payment Intent: client_secret is null');
		}

		return paymentIntent as Stripe.PaymentIntent & { client_secret: string };
	}

	async handleStripeWebhook(req: RawBodyRequest<Request>): Promise<void> {
		const sig = req.headers['stripe-signature'] as string;
		const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_KEY');
		let event: Stripe.Event;

		try {
			event = this.stripe.webhooks.constructEvent(
				req.rawBody ?? '', // probably not good
				sig,
				webhookSecret
			);
		} catch {
			throw new BadRequestException('Webhook Error: Invalid signature');
		}

		if (event.type === 'payment_intent.succeeded') {
			await this.handleCheckoutCompleted(event.data.object);
		} else if (event.type === 'payment_intent.payment_failed') {
			await this.handleCheckoutExpired(event.data.object);
		}
	}

	async handleCheckoutCompleted(
		paymentIntent: Stripe.PaymentIntent
	): Promise<void> {
		await this.prisma.payment.updateMany({
			where: {
				transactionId: paymentIntent.id,
			},
			data: {
				status: PaymentStatus.COMPLETED,
			},
		});
	}

	async handleCheckoutExpired(
		paymentIntent: Stripe.PaymentIntent
	): Promise<void> {
		await this.prisma.$transaction(async (prisma) => {
			const payment = await prisma.payment.findFirst({
				where: {
					transactionId: paymentIntent.id,
				},
				include: {
					tickets: {
						include: {
							ticket: true,
						},
					},
				},
			});

			if (!payment) return;

			await prisma.payment.update({
				where: {
					id: payment.id,
				},
				data: {
					status: PaymentStatus.FAILED,
				},
			});

			const ticketIds = payment.tickets.map((ticket) => ticket.ticketId);
			await prisma.ticket.deleteMany({
				where: {
					id: {
						in: ticketIds,
					},
				},
			});

			await prisma.event.update({
				where: {
					id: Number(paymentIntent.metadata?.eventId),
				},
				data: {
					ticketsSold: {
						decrement: ticketIds.length,
					},
				},
			});
		});
	}
}
