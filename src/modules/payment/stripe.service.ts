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

	async createCheckoutSession(
		itemTitle: string,
		itemPrice: Prisma.Decimal,
		itemQuantity: number,
		metadata?: Stripe.Metadata
	) {
		return this.stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: { name: `${itemTitle} Ticket` },
						unit_amount: itemPrice.mul(100).round().toNumber(),
					},
					quantity: itemQuantity,
				},
			],
			mode: 'payment',
			success_url: `${this.configService.get('CLIENT_URL')}/payments/success`,
			cancel_url: `${this.configService.get('CLIENT_URL')}/payments/cancel`,
			metadata,
		});
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

		if (event.type === 'checkout.session.completed') {
			await this.handleCheckoutCompleted(event.data.object);
		} else if (event.type === 'checkout.session.expired') {
			await this.handleCheckoutExpired(event.data.object);
		}
	}

	async handleCheckoutCompleted(
		session: Stripe.Checkout.Session
	): Promise<void> {
		await this.prisma.payment.updateMany({
			where: {
				transactionId: session.id,
			},
			data: {
				status: PaymentStatus.COMPLETED,
			},
		});
	}

	async handleCheckoutExpired(session: Stripe.Checkout.Session): Promise<void> {
		await this.prisma.$transaction(async (prisma) => {
			const payment = await prisma.payment.findFirst({
				where: {
					transactionId: session.id,
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
					id: Number(session.metadata?.eventId),
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
