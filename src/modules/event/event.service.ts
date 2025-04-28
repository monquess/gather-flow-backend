import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { FilteringOptionsDto } from './dto/filtering-options.dto';
import { Paginated } from '@common/pagination/paginated';
import { EventEntity } from './entities/event.entity';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { StripeService } from '@modules/payment/stripe.service';
import { TicketService } from '@modules/ticket/ticket.service';
import { CreateEventTicketResponseDto } from './dto/create-event-ticket-response.dto';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { CompanyService } from '@modules/company/company.service';
import { PromocodeEntity } from './entities/promocode.entity';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';

@Injectable()
export class EventService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly stripeService: StripeService,
		private readonly ticketService: TicketService,
		@Inject(forwardRef(() => CompanyService))
		private readonly companyService: CompanyService
	) {}

	async findAll(
		{
			title,
			format,
			theme,
			companyId,
			startDate,
			endDate,
		}: FilteringOptionsDto,
		{ page, limit }: PaginationOptionsDto
	): Promise<Paginated<EventEntity>> {
		const where: Prisma.EventWhereInput = {
			AND: [
				{
					title: {
						contains: title,
						mode: 'insensitive',
					},
				},
				{
					format,
				},
				{
					theme,
				},
				{
					companyId,
				},
				{
					startDate: {
						gte: startDate,
					},
				},
				{
					endDate: {
						lte: endDate,
					},
				},
			],
		};

		const [events, count] = await this.prisma.$transaction([
			this.prisma.event.findMany({
				where,
				take: limit,
				skip: limit * (page - 1),
				orderBy: { createdAt: 'asc' },
			}),
			this.prisma.event.count({ where }),
		]);

		return {
			data: events,
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async findById(id: number): Promise<EventEntity> {
		return this.prisma.event.findUniqueOrThrow({
			where: { id },
		});
	}

	async findEventPromocodes(
		eventId: number,
		user: User
	): Promise<PromocodeEntity[]> {
		const event = await this.findById(eventId);
		await this.companyService.checkIsCompanyAdmin(user.id, event.companyId);

		return this.prisma.promocode.findMany({
			where: { eventId },
		});
	}

	async createEventTicket(
		eventId: number,
		dto: CreateTicketDto,
		user: User
	): Promise<CreateEventTicketResponseDto> {
		const event = await this.findById(eventId);
		const availableTickets = event.ticketsQuantity - event.ticketsSold;

		if (dto.quantity > availableTickets) {
			throw new BadRequestException(
				`Only ${availableTickets} tickets remaining`
			);
		}

		let discount = 0;
		let promocodeId: number | null = null;

		if (dto.promocode) {
			const promocode = await this.prisma.promocode.findFirstOrThrow({
				where: {
					code: dto.promocode,
					eventId,
					isActive: true,
				},
			});

			discount = promocode.discount;
			promocodeId = promocode.id;
		}

		const result = await this.prisma.$transaction(async (prisma) => {
			const tickets = await Promise.all(
				Array(dto.quantity)
					.fill(null)
					.map(() =>
						prisma.ticket.create({
							data: {
								userId: user.id,
								eventId,
								ticketCode: this.ticketService.generateTicketCode(),
								finalPrice: event.ticketPrice.mul(100 - discount).div(100),
								purchaseDate: new Date(),
								promocodeId,
							},
						})
					)
			);

			await prisma.event.update({
				where: {
					id: eventId,
				},
				data: {
					ticketsSold: {
						increment: dto.quantity,
					},
				},
			});

			const paymentIntent = await this.stripeService.createPaymentIntent(
				event.title,
				event.ticketPrice.mul(100 - discount).div(100),
				dto.quantity,
				{
					userId: user.id.toString(),
					userEmail: user.email,
					eventId: eventId.toString(),
					companyId: event.companyId.toString(),
					ticketIds: tickets.map((t) => t.id).join(','),
				}
			);

			await prisma.payment.create({
				data: {
					userId: user.id,
					transactionId: paymentIntent.id,
					tickets: {
						create: tickets.map((ticket) => ({
							ticketId: ticket.id,
						})),
					},
				},
			});

			return { clientSecret: paymentIntent.client_secret };
		});

		return result;
	}

	async createEventPromocode(
		eventId: number,
		dto: CreatePromocodeDto,
		user: User
	): Promise<PromocodeEntity> {
		const event = await this.findById(eventId);
		await this.companyService.checkIsCompanyAdmin(user.id, event.companyId);

		return this.prisma.promocode.create({
			data: {
				...dto,
				eventId,
			},
		});
	}

	async updateEventPromocode(
		eventId: number,
		promocodeId: number,
		dto: UpdatePromocodeDto,
		user: User
	): Promise<PromocodeEntity> {
		const event = await this.findById(eventId);
		await this.companyService.checkIsCompanyAdmin(user.id, event.companyId);

		return this.prisma.promocode.update({
			where: {
				id: promocodeId,
			},
			data: {
				...dto,
				eventId,
			},
		});
	}
}
