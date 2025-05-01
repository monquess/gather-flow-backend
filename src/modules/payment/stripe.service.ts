import { CompanyService } from '@modules/company/company.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	RawBodyRequest,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PaymentStatus, Prisma, User } from '@prisma/client';
import Stripe from 'stripe';
import { ConnectStripeResponseDto } from './dto/connect-stripe-response.dto';
import { TicketService } from '@modules/ticket/ticket.service';
import { MailService } from '@modules/mail/mail.service';
import { StripeConfig, stripeConfig } from '@modules/config/configs/stripe.config';
import { AppConfig, appConfig } from '@modules/config/configs';
import { NotificationService } from '@modules/notification/notification.service';
import { NewAttendeeNotification } from '@modules/notification/notifications/new-attendee.notification';

@Injectable()
export class StripeService {
	private stripe: Stripe;

	constructor(
		private readonly prisma: PrismaService,
		private readonly ticketService: TicketService,
		@Inject(forwardRef(() => CompanyService))
		private readonly companyService: CompanyService,
		private readonly mailService: MailService,
		@Inject(stripeConfig.KEY)
		private readonly stripeConfig: ConfigType<StripeConfig>,
		@Inject(appConfig.KEY)
		private readonly appConfig: ConfigType<AppConfig>,
		private readonly notificationService: NotificationService
	) {
		this.stripe = new Stripe(stripeConfig.secretKey);
	}

	async getStripeConnectUrl(
		companyId: number,
		user: User
	): Promise<ConnectStripeResponseDto> {
		await this.companyService.checkIsCompanyAdmin(user.id, companyId);

		const redirectUri = `${this.appConfig.clientUrl}/company/${companyId}/success-connect`;
		const stripeClientId = this.stripeConfig.clientId;
		const stripeConnectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${stripeClientId}&scope=read_write&redirect_uri=${redirectUri}&state=${companyId}`;

		return { url: stripeConnectUrl };
	}

	async handleStripeOAuthCallback(code: string, companyId: number): Promise<void> {
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
		const company = await this.companyService.findById(Number(metadata?.companyId));

		if (!company?.stripeAccountId) {
			throw new BadRequestException('Company does not have a connected Stripe account');
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
		const webhookSecret = this.stripeConfig.webhookKey;
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

	async handleCheckoutCompleted(paymentIntent: Stripe.PaymentIntent): Promise<void> {
		const ticketIds = paymentIntent.metadata.ticketIds?.split(',').map(Number);
		const userId = Number(paymentIntent.metadata.userId);

		const ticketPdfs = await Promise.all(
			ticketIds.map((ticketId) => this.ticketService.generateTicketPdf(ticketId))
		);

		await this.prisma.payment.updateMany({
			where: {
				transactionId: paymentIntent.id,
			},
			data: {
				status: PaymentStatus.COMPLETED,
			},
		});

		await this.mailService.sendMail({
			to: paymentIntent.metadata.userEmail,
			subject: 'Your Tickets for the Event',
			templateName: 'event-ticket',
			attachments: ticketPdfs,
		});

		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) return;

		await this.notificationService.send(
			user,
			new NewAttendeeNotification({
				eventTitle: paymentIntent.metadata.eventTitle,
			})
		);
	}

	async handleCheckoutExpired(paymentIntent: Stripe.PaymentIntent): Promise<void> {
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
