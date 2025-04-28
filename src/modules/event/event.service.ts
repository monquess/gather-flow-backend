import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Prisma, User, EventStatus } from '@prisma/client';
import { PrismaService } from '@modules/prisma/prisma.service';
import { EventEntity } from './entities/event.entity';
import { EventFilteringOptionsDto } from './dto/filtering-options.dto';
import { EventSortingOptionsDto } from './dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { StripeService } from '@modules/payment/stripe.service';
import { TicketService } from '@modules/ticket/ticket.service';
import { CreateEventTicketResponseDto } from './dto/create-event-ticket-response.dto';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { CompanyService } from '@modules/company/company.service';
import { PromocodeEntity } from './entities/promocode.entity';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { EventSearchService } from '@modules/search/event-search.service';
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { Paginated } from '@common/pagination/paginated';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';
import { CreateCommentDto } from '@modules/comment/dto';
import { CommentEntity } from '@modules/comment/entities/comment.entity';

@Injectable()
export class EventService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly stripeService: StripeService,
		private readonly ticketService: TicketService,
		@Inject(forwardRef(() => CompanyService))
		private readonly companyService: CompanyService,
		private readonly searchService: EventSearchService
	) {}

	async index(): Promise<void> {
		const events = await this.prisma.event.findMany();
		await this.searchService.indexBulk(events);
	}

	async findById(id: number): Promise<EventEntity> {
		const event = await this.prisma.event.findUniqueOrThrow({
			where: {
				id,
			},
			include: {
				company: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			omit: {
				companyId: true,
			},
		});

		return new EventEntity(event);
	}

	async findAll(
		options: EventFilteringOptionsDto,
		{ sort, order }: EventSortingOptionsDto,
		{ page, limit }: PaginationOptionsDto
	): Promise<Paginated<EventEntity>> {
		const [events, count] = await this.searchService.search(
			{ ...options, status: EventStatus.PUBLISHED },
			sort,
			order,
			page,
			limit
		);

		const ids = events.map((event) => event.id);
		const result = await this.prisma.event.findMany({
			where: {
				id: {
					in: ids,
				},
			},
			include: {
				company: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			omit: {
				companyId: true,
			},
		});

		return {
			data: ids.map((id) => {
				return new EventEntity(result.find((e) => e.id === id)!);
			}),
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async findSimilar(id: number, limit: number): Promise<EventEntity[]> {
		const event = await this.findById(id);
		const similar = await this.searchService.similar(event.id.toString(), limit);

		const ids = similar.map((event) => event.id);
		const events = await this.prisma.event.findMany({
			where: {
				id: {
					in: ids,
				},
			},
			include: {
				company: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			omit: {
				companyId: true,
			},
		});

		return ids.map((id) => new EventEntity(events.find((e) => e.id === id)!));
	}

	async findComments(
		eventId: number,
		{ page, limit }: PaginationOptionsDto
	): Promise<Paginated<CommentEntity>> {
		await this.findById(eventId);

		const where: Prisma.CommentWhereInput = {
			eventId,
			parent: null,
		};
		const [comments, count] = await this.prisma.$transaction([
			this.prisma.comment.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				include: {
					author: {
						select: {
							id: true,
							username: true,
							avatar: true,
						},
					},
					_count: {
						select: {
							replies: true,
						},
					},
				},
				omit: {
					authorId: true,
				},
			}),
			this.prisma.comment.count({ where }),
		]);

		return {
			data: comments.map(({ _count, ...comment }) => ({
				...comment,
				hasReplies: _count.replies > 0,
			})),
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async createComment(
		eventId: number,
		dto: CreateCommentDto,
		user: User
	): Promise<CommentEntity> {
		await this.findById(eventId);
		return this.prisma.comment.create({
			data: {
				...dto,
				eventId,
				authorId: user.id,
			},
			include: {
				author: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
			},
			omit: {
				authorId: true,
			},
		});
	}

	async createEventPromocode(
		eventId: number,
		dto: CreatePromocodeDto,
		user: User
	): Promise<PromocodeEntity> {
		const event = await this.findById(eventId);
		await this.companyService.checkIsCompanyAdmin(user.id, event.company?.id);

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
		await this.companyService.checkIsCompanyAdmin(user.id, event.company?.id);

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

	async findEventPromocodes(eventId: number, user: User): Promise<PromocodeEntity[]> {
		const event = await this.findById(eventId);
		await this.companyService.checkIsCompanyAdmin(user.id, event.company?.id);

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
			throw new BadRequestException(`Only ${availableTickets} tickets remaining`);
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

			if (!event.company) {
				throw new NotFoundException('Company not found');
			}

			const paymentIntent = await this.stripeService.createPaymentIntent(
				event.title,
				event.ticketPrice.mul(100 - discount).div(100),
				dto.quantity,
				{
					userId: user.id.toString(),
					userEmail: user.email,
					eventId: eventId.toString(),
					companyId: event.company.id.toString(),
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
}
