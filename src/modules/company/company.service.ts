import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
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
} from './dto';

import { CompanyMemberEntity } from './entities/company-member.entity';
import { CompanyEntity } from './entities/company.entity';
import { PublishEventJobData } from './interfaces/publish-event-job-data.interface';

import { CreateEventDto } from '@modules/company/dto/create-event.dto';
import { S3Service } from '@modules/s3/s3.service';
import { EventEntity } from '@modules/event/entities/event.entity';
import { UpdateEventDto } from '@modules/company/dto/update-event.dto';
import { EventService } from '@modules/event/event.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import { AppConfig, appConfig } from '@modules/config/configs';
import { EventSearchService } from '@modules/search/event-search.service';
import { CreatePostDto, UpdatePostDto } from '@modules/post/dto';
import { PostEntity } from '@modules/post/entities/post.entity';
import { StoragePath } from '@modules/s3/enum/storage-path.enum';
import { PostService } from '@modules/post/post.service';

@Injectable()
export class CompanyService {
	constructor(
		@Inject(appConfig.KEY)
		private readonly config: ConfigType<AppConfig>,
		private readonly prisma: PrismaService,
		private readonly s3Service: S3Service,
		private readonly postService: PostService,
		private readonly eventService: EventService,
		private readonly eventSearchService: EventSearchService,
		@InjectQueue('publishEvent')
		private readonly publishQueue: Queue
	) {}

	async findById(id: number): Promise<CompanyEntity> {
		return this.prisma.company.findUniqueOrThrow({
			where: { id },
			include: {
				users: true,
			},
		});
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
					createdAt: 'asc',
				},
				include: {
					users: true,
				},
			}),
			this.prisma.company.count({ where }),
		]);

		return {
			data: companies,
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async findEvents(
		companyId: number,
		options: CompanyEventFilteringOptionsDto,
		{ page, limit }: PaginationOptionsDto,
		user: User
	): Promise<Paginated<EventEntity>> {
		const company = await this.findById(companyId);
		const role = company.users?.find((u) => u.userId === user?.id)?.role;

		const status = role === CompanyRole.ADMIN ? options.status : EventStatus.PUBLISHED;
		const [events, count] = await this.eventSearchService.search(
			{ ...options, status },
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
		});

		return {
			data: ids
				.map((id) => result.find((e) => e.id === id))
				.filter((e) => e !== undefined),
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async create(dto: CreateCompanyDto, user: User): Promise<CompanyEntity> {
		return this.prisma.company.create({
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
	}

	async createCompanyMember(
		companyId: number,
		targetUserId: number,
		{ role }: CreateCompanyMemberDto,
		user: User
	): Promise<CompanyMemberEntity> {
		await this.checkMembership(companyId, user);
		return this.prisma.companyMember.create({
			data: {
				companyId,
				userId: targetUserId,
				role,
			},
		});
	}

	async createEvent(
		companyId: number,
		dto: CreateEventDto,
		user: User,
		poster?: Express.Multer.File
	): Promise<EventEntity> {
		await this.checkMembership(companyId, user);

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

		return event;
	}

	async update(id: number, dto: UpdateCompanyDto, user: User): Promise<CompanyEntity> {
		await this.checkMembership(id, user);
		return this.prisma.company.update({
			where: {
				id,
			},
			data: dto,
		});
	}

	async updateCompanyMemberRole(
		companyId: number,
		targetUserId: number,
		{ role }: UpdateCompanyMemberRoleDto,
		user: User
	): Promise<CompanyMemberEntity> {
		await this.checkMembership(companyId, user);
		return this.prisma.companyMember.update({
			where: {
				userId_companyId: {
					userId: targetUserId,
					companyId,
				},
			},
			data: {
				role,
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
		const event = await this.eventService.findById(eventId);

		await this.checkMembership(companyId, user);

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

		return updatedEvent;
	}

	async remove(id: number, user: User): Promise<void> {
		await this.checkMembership(id, user);
		await this.prisma.company.delete({
			where: {
				id,
			},
		});
	}

	async removeCompanyMember(
		companyId: number,
		targetUserId: number,
		user: User
	): Promise<void> {
		const company = await this.findById(companyId);
		const currentUserMembership = company.users?.find((u) => u.userId === user.id);

		if (currentUserMembership?.role !== CompanyRole.ADMIN && user.id !== targetUserId) {
			// can't delete members except yourself if you are not admin
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

		await this.checkMembership(companyId, user);

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

	async createPost(
		companyId: number,
		dto: CreatePostDto,
		user: User,
		poster?: Express.Multer.File
	): Promise<PostEntity> {
		await this.checkMembership(companyId, user);

		let posterUrl = this.config.defaults.poster;
		if (poster) {
			const { url } = await this.s3Service.uploadFile(StoragePath.POSTERS, poster);
			posterUrl = url;
		}

		return this.prisma.post.create({
			data: {
				...dto,
				companyId,
				poster: posterUrl,
			},
		});
	}

	async updatePost(
		companyId: number,
		postId: number,
		dto: UpdatePostDto,
		user: User,
		poster?: Express.Multer.File
	): Promise<PostEntity> {
		const post = await this.postService.findById(postId);

		await this.checkMembership(companyId, user);

		let posterUrl = post.poster;
		if (poster) {
			if (post.poster !== this.config.defaults.poster) {
				await this.s3Service.deleteFile(post.poster);
			}

			const { url } = await this.s3Service.uploadFile(StoragePath.POSTERS, poster);
			posterUrl = url;
		}

		return this.prisma.post.update({
			where: {
				id: postId,
			},
			data: {
				...dto,
				poster: posterUrl,
			},
		});
	}

	async removePost(companyId: number, postId: number, user: User): Promise<void> {
		await this.checkMembership(companyId, user);
		await this.prisma.post.delete({
			where: {
				id: postId,
			},
		});
	}

	private async checkMembership(companyId: number, user: User): Promise<void> {
		const company = await this.findById(companyId);
		const membership = company.users?.find((u) => u.userId === user.id);

		if (!membership) {
			throw new ForbiddenException('Access denied');
		}
	}
}
