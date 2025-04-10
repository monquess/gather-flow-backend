import { EnvironmentVariables } from '@config/env/environment-variables.config';
import { PrismaService } from '@modules/prisma/prisma.service';
import {
	BadRequestException,
	Injectable,
	RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus, Prisma } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
	private stripe: Stripe;

	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService<EnvironmentVariables, true>
	) {
		this.stripe = new Stripe(
			this.configService.get<string>('STRIPE_SECRET_KEY')
		);
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
