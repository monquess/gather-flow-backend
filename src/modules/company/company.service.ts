import {
	BadRequestException,
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { CompanyRole, EventStatus, Prisma, User } from '@prisma/client';
import { Job, Queue } from 'bullmq';
import { PaginationOptionsDto, Paginated, getPaginationMeta } from '@common/pagination';
import {
	CreateCompanyDto,
	UpdateCompanyDto,
	CreateCompanyMemberDto,
	UpdateCompanyMemberRoleDto,
	CompanyFilteringOptionsDto,
	CompanyEventFilteringOptionsDto,
	CreateEventDto,
	UpdateEventDto,
	CreateReviewDto,
	UpdateReviewDto,
} from './dto';
import { CompanyMemberEntity } from './entities/company-member.entity';
import { CompanyEntity } from './entities/company.entity';
import { PublishEventJobData } from './interfaces/publish-event-job-data.interface';
import { AppConfig, appConfig } from '@modules/config/configs';
import { PrismaService } from '@modules/prisma/prisma.service';
import { StoragePath } from '@modules/s3/enum/storage-path.enum';
import { S3Service } from '@modules/s3/s3.service';
import { EventSortingOptionsDto } from '@modules/event/dto';
import { EventEntity } from '@modules/event/entities/event.entity';
import { EventService } from '@modules/event/event.service';
import { EventSearchService } from '@modules/search/event-search.service';
import { CreatePostDto, UpdatePostDto, PostSortingOptionsDto } from '@modules/post/dto';
import { PostEntity } from '@modules/post/entities/post.entity';
import { SortFields } from '@modules/post/enum/sort-fields.enum';
import { PostService } from '@modules/post/post.service';
import { ReviewEntity } from './entities/review.entity';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { NotificationService } from '@modules/notification/notification.service';
import { NewEventNotification } from '@modules/notification/notifications/new-event.notification';
import { NewPostNotification } from '@modules/notification/notifications/new-post.notification';

@Injectable()
export class CompanyService {
	constructor(
		@Inject(appConfig.KEY)
		private readonly config: ConfigType<AppConfig>,
		private readonly prisma: PrismaService,
		private readonly s3Service: S3Service,
		private readonly postService: PostService,
		@Inject(forwardRef(() => EventService))
		private readonly eventService: EventService,
		private readonly eventSearchService: EventSearchService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subscriptionService: SubscriptionService,
		private readonly notificationService: NotificationService,
		@InjectQueue('publishEvent')
		private readonly publishQueue: Queue
	) {}

	async findById(id: number): Promise<CompanyEntity> {
		const { _count, rating, ...company } = await this.prisma.company.findUniqueOrThrow({
			where: { id },
			include: {
				users: {
					include: {
						user: {
							select: {
								id: true,
								username: true,
								avatar: true,
							},
						},
					},
					omit: {
						companyId: true,
						userId: true,
					},
				},
				_count: {
					select: {
						reviews: true,
					},
				},
			},
		});

		return {
			...company,
			rating: rating.toNumber(),
			reviews: _count.reviews,
		};
	}

	async findAll(
		{ name }: CompanyFilteringOptionsDto,
		{ page, limit }: PaginationOptionsDto
	): Promise<Paginated<CompanyEntity>> {
		const where: Prisma.CompanyWhereInput = {
			name: {
				contains: name,
				mode: 'insensitive',
			},
		};

		const [companies, count] = await this.prisma.$transaction([
			this.prisma.company.findMany({
				where,
				take: limit,
				skip: limit * (page - 1),
				orderBy: {
					createdAt: 'desc',
				},
				include: {
					users: {
						include: {
							user: {
								select: {
									id: true,
									username: true,
									avatar: true,
								},
							},
						},
						omit: {
							companyId: true,
							userId: true,
						},
					},
					_count: {
						select: {
							reviews: true,
						},
					},
				},
			}),
			this.prisma.company.count({ where }),
		]);

		return {
			data: companies.map(({ _count, rating, ...company }) => ({
				...company,
				rating: rating.toNumber(),
				reviews: _count.reviews,
			})),
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async findEvents(
		companyId: number,
		options: CompanyEventFilteringOptionsDto,
		{ sort, order }: EventSortingOptionsDto,
		{ page, limit }: PaginationOptionsDto,
		user: User
	): Promise<Paginated<EventEntity>> {
		const company = await this.findById(companyId);
		const role = company.users?.find((u) => u.user.id === user?.id)?.role;

		const status = role === CompanyRole.ADMIN ? options.status : EventStatus.PUBLISHED;
		const [events, count] = await this.eventSearchService.search(
			{ ...options, status, companyId },
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

	async create(dto: CreateCompanyDto, user: User): Promise<CompanyEntity> {
		const { rating, ...company } = await this.prisma.company.create({
			data: {
				...dto,
				users: {
					create: {
						userId: user.id,
						role: CompanyRole.ADMIN,
					},
				},
			},
		});

		return {
			...company,
			rating: rating.toNumber(),
			reviews: 0,
		};
	}

	async createCompanyMember(
		companyId: number,
		targetUserId: number,
		dto: CreateCompanyMemberDto,
		user: User
	): Promise<CompanyMemberEntity> {
		await this.checkIsCompanyAdmin(user.id, companyId);

		return this.prisma.companyMember.create({
			data: {
				companyId,
				userId: targetUserId,
				...dto,
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
			},
			omit: {
				userId: true,
			},
		});
	}

	async createEvent(
		companyId: number,
		dto: CreateEventDto,
		user: User,
		poster?: Express.Multer.File
	): Promise<EventEntity> {
		const company = await this.checkIsCompanyAdmin(user.id, companyId);

		if (!company?.stripeAccountId) {
			throw new BadRequestException('Company does not have a connected Stripe account');
		}

		let posterUrl = this.config.defaults.poster;
		if (poster) {
			const { url } = await this.s3Service.uploadFile(StoragePath.POSTERS, poster);
			posterUrl = url;
		}

		const event = await this.prisma.$transaction(async (prisma) => {
			const newEvent = await prisma.event.create({
				data: {
					...dto,
					companyId,
					poster: posterUrl,
					status: dto.publishDate ? EventStatus.DRAFT : EventStatus.PUBLISHED,
					promocodes: {
						createMany: {
							data: dto.promocodes,
						},
					},
				},
			});
			await this.eventSearchService.index(newEvent);

			if (dto.publishDate) {
				await this.publishQueue.add(
					'publishEvent',
					{ eventId: newEvent.id },
					{
						delay: new Date(dto.publishDate).getTime() - Date.now(),
						jobId: `event-${newEvent.id}`,
						removeOnComplete: true,
					}
				);
			}

			return newEvent;
		});

		const subscribers = await this.subscriptionService.findAll({
			companyId,
		});

		await this.notificationService.send(
			subscribers.map((s) => s.user) as User[],
			new NewEventNotification({
				companyName: company.name,
				eventTitle: event.title,
			})
		);

		return new EventEntity(event);
	}

	async update(id: number, dto: UpdateCompanyDto, user: User): Promise<CompanyEntity> {
		await this.checkIsCompanyAdmin(user.id, id);

		const { _count, rating, ...company } = await this.prisma.company.update({
			data: dto,
			where: {
				id,
			},
			include: {
				_count: {
					select: {
						reviews: true,
					},
				},
			},
		});

		return {
			...company,
			rating: rating.toNumber(),
			reviews: _count.reviews,
		};
	}

	async updateCompanyMemberRole(
		companyId: number,
		targetUserId: number,
		dto: UpdateCompanyMemberRoleDto,
		user: User
	): Promise<CompanyMemberEntity> {
		await this.checkIsCompanyAdmin(user.id, companyId);

		return this.prisma.companyMember.update({
			where: {
				userId_companyId: {
					userId: targetUserId,
					companyId,
				},
			},
			data: dto,
			include: {
				user: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
			},
			omit: {
				userId: true,
			},
		});
	}

	async updateEvent(
		companyId: number,
		eventId: number,
		dto: UpdateEventDto,
		user: User,
		poster?: Express.Multer.File
	): Promise<EventEntity> {
		await this.checkIsCompanyAdmin(user.id, companyId);
		const event = await this.eventService.findById(eventId);

		if (event.status === EventStatus.PUBLISHED) {
			throw new BadRequestException('Cannot update published event');
		}

		let posterUrl = event.poster;

		if (poster) {
			if (event.poster !== this.config.defaults.poster) {
				await this.s3Service.deleteFile(event.poster);
			}

			const { url } = await this.s3Service.uploadFile(StoragePath.POSTERS, poster);
			posterUrl = url;
		}

		const updatedEvent = await this.prisma.$transaction(async (prisma) => {
			const newEvent = await prisma.event.update({
				where: {
					id: eventId,
				},
				data: {
					...dto,
					poster: posterUrl,
				},
			});
			await this.eventSearchService.update(newEvent);

			const job = (await this.publishQueue.getJob(
				`event-${eventId}`
			)) as Job<PublishEventJobData>;

			if (dto.status === EventStatus.PUBLISHED) {
				if (job) {
					await job.remove();
				}
			} else if (dto.publishDate) {
				if (job) {
					await job.remove();
				}

				if (newEvent.status === EventStatus.DRAFT) {
					await this.publishQueue.add(
						'publishEvent',
						{ eventId: newEvent.id },
						{
							delay: new Date(dto.publishDate).getTime() - Date.now(),
							jobId: `event-${newEvent.id}`,
							removeOnComplete: true,
						}
					);
				}
			}

			return newEvent;
		});

		return new EventEntity(updatedEvent);
	}

	async remove(id: number, user: User): Promise<void> {
		await this.checkIsCompanyAdmin(user.id, id);

		await this.prisma.company.delete({ where: { id } });
	}

	async removeCompanyMember(
		companyId: number,
		targetUserId: number,
		user: User
	): Promise<void> {
		const company = await this.findById(companyId);
		const currentUserMembership = company.users?.find((u) => u.user.id === user.id);

		if (currentUserMembership?.role !== CompanyRole.ADMIN && user.id !== targetUserId) {
			throw new ForbiddenException('Access denied');
		}

		await this.prisma.companyMember.delete({
			where: {
				userId_companyId: {
					userId: targetUserId,
					companyId,
				},
			},
		});
	}

	async removeEvent(companyId: number, eventId: number, user: User): Promise<void> {
		const event = await this.eventService.findById(eventId);

		if (event.status === EventStatus.PUBLISHED) {
			throw new BadRequestException('Cannot remove published event');
		}

		await this.checkIsCompanyAdmin(user.id, companyId);

		if (event.poster !== this.config.defaults.poster) {
			await this.s3Service.deleteFile(event.poster);
		}

		await this.prisma.$transaction(async (prisma) => {
			const deletedEvent = await prisma.event.delete({
				where: {
					id: eventId,
				},
			});
			await this.eventSearchService.remove(deletedEvent);

			const job = (await this.publishQueue.getJob(
				`event-${eventId}`
			)) as Job<PublishEventJobData>;

			if (job) {
				await job.remove();
			}
		});
	}

	async checkIsCompanyAdmin(userId: number, companyId?: number): Promise<CompanyEntity> {
		if (!companyId) {
			throw new NotFoundException('Company not found');
		}

		const company = await this.findById(companyId);

		const membership = company.users?.find((u) => u.user.id === userId);

		if (membership?.role !== CompanyRole.ADMIN) {
			throw new ForbiddenException('Access denied');
		}

		return company;
	}

	async findPosts(
		companyId: number,
		{ sort, order }: PostSortingOptionsDto,
		{ page, limit }: PaginationOptionsDto,
		user?: User
	): Promise<Paginated<PostEntity>> {
		// prettier-ignore
		const orderBy =	sort === SortFields.LIKES ? { likes: { _count: order } } : { [sort]: order };
		const where: Prisma.PostWhereInput = {
			companyId,
		};

		const [posts, count] = await this.prisma.$transaction([
			this.prisma.post.findMany({
				where,
				include: {
					_count: {
						select: {
							likes: true,
						},
					},
					likes: {
						where: {
							userId: user?.id,
						},
					},
				},
				take: limit,
				skip: (page - 1) * limit,
				orderBy,
			}),
			this.prisma.post.count({ where }),
		]);

		return {
			data: posts.map(({ _count, ...post }) => ({
				...post,
				likes: _count.likes,
				liked: post.likes.length > 0,
			})),
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async createPost(
		companyId: number,
		dto: CreatePostDto,
		user: User,
		poster?: Express.Multer.File
	): Promise<PostEntity> {
		const company = await this.checkIsCompanyAdmin(user.id, companyId);

		let posterUrl = this.config.defaults.poster;
		if (poster) {
			const { url } = await this.s3Service.uploadFile(StoragePath.POSTERS, poster);
			posterUrl = url;
		}

		const post = await this.prisma.post.create({
			data: {
				...dto,
				companyId,
				poster: posterUrl,
			},
		});

		const subscribers = await this.subscriptionService.findAll({
			companyId,
		});

		await this.notificationService.send(
			subscribers.map((s) => s.user) as User[],
			new NewPostNotification({
				companyName: company.name,
				postTitle: post.title,
			})
		);

		return {
			...post,
			likes: 0,
			liked: false,
		};
	}

	async updatePost(
		companyId: number,
		postId: number,
		dto: UpdatePostDto,
		user: User,
		poster?: Express.Multer.File
	): Promise<PostEntity> {
		const post = await this.postService.findById(postId);

		await this.checkIsCompanyAdmin(user.id, companyId);

		let posterUrl = post.poster;
		if (poster) {
			if (post.poster !== this.config.defaults.poster) {
				await this.s3Service.deleteFile(post.poster);
			}

			const { url } = await this.s3Service.uploadFile(StoragePath.POSTERS, poster);
			posterUrl = url;
		}

		const { _count, ...result } = await this.prisma.post.update({
			where: {
				id: postId,
			},
			data: {
				...dto,
				poster: posterUrl,
			},
			include: {
				_count: {
					select: {
						likes: true,
					},
				},
				likes: {
					where: {
						userId: user.id,
					},
				},
			},
		});

		return {
			...result,
			likes: _count.likes,
			liked: result.likes.length > 0,
		};
	}

	async removePost(companyId: number, postId: number, user: User): Promise<void> {
		await this.checkIsCompanyAdmin(user.id, companyId);

		await this.prisma.post.delete({
			where: {
				id: postId,
			},
		});
	}

	async findReviews(
		companyId: number,
		{ page, limit }: PaginationOptionsDto
	): Promise<Paginated<ReviewEntity>> {
		const where: Prisma.ReviewWhereInput = {
			companyId,
		};
		const [reviews, count] = await this.prisma.$transaction([
			this.prisma.review.findMany({
				where,
				take: limit,
				skip: (page - 1) * limit,
				orderBy: {
					createdAt: 'desc',
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
			}),
			this.prisma.review.count({ where }),
		]);

		return {
			data: reviews,
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async createReview(
		companyId: number,
		dto: CreateReviewDto,
		user: User
	): Promise<ReviewEntity> {
		await this.findById(companyId);
		const review = await this.prisma.review.create({
			data: {
				...dto,
				companyId,
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

		await this.updateCompanyRating(companyId);

		return review;
	}

	async updateReview(
		companyId: number,
		dto: UpdateReviewDto,
		user: User
	): Promise<ReviewEntity> {
		const review = await this.prisma.review.update({
			where: {
				authorId_companyId: {
					authorId: user.id,
					companyId,
				},
			},
			data: dto,
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

		await this.updateCompanyRating(companyId);

		return review;
	}

	async removeReview(companyId: number, user: User): Promise<void> {
		await this.prisma.review.delete({
			where: {
				authorId_companyId: {
					authorId: user.id,
					companyId: companyId,
				},
			},
		});

		await this.updateCompanyRating(companyId);
	}

	private async updateCompanyRating(companyId: number): Promise<void> {
		const { _avg } = await this.prisma.review.aggregate({
			where: {
				companyId,
			},
			_avg: {
				stars: true,
			},
		});

		await this.prisma.company.update({
			where: {
				id: companyId,
			},
			data: {
				rating: Math.round((_avg.stars ?? 0) * 10) / 10,
			},
		});
	}
}
