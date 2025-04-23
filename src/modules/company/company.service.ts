import { PrismaService } from '@modules/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CompanyEntity } from './entities/company.entity';
import { FilteringOptionsDto } from './dto/filtering-options.dto';
import { getPaginationMeta } from '@common/pagination/paginated-metadata';
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { Paginated } from '@common/pagination/paginated';
import { CompanyRole, EventStatus, Prisma, User } from '@prisma/client';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateCompanyMemberDto } from './dto/create-company-member.dto';
import { CompanyMemberEntity } from './entities/company-member.entity';
import { UpdateCompanyMemberRoleDto } from './dto/update-company-member-role.dto';
import { CreateEventDto } from '@modules/company/dto/create-event.dto';
import { S3Service } from '@modules/s3/s3.service';
import { EventEntity } from '@modules/event/entities/event.entity';
import { UpdateEventDto } from '@modules/company/dto/update-event.dto';
import { EventService } from '@modules/event/event.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/env/environment-variables.config';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PublishEventJobData } from './interfaces/publish-event-job-data.interface';

@Injectable()
export class CompanyService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly s3Service: S3Service,
		private readonly eventService: EventService,
		private readonly configService: ConfigService<EnvironmentVariables, true>,
		@InjectQueue('publishEvent') private publishQueue: Queue
	) {}

	async findAll(
		{ name }: FilteringOptionsDto,
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
				orderBy: { createdAt: 'asc' },
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

	async findById(id: number): Promise<CompanyEntity> {
		return this.prisma.company.findUniqueOrThrow({
			where: { id },
			include: {
				users: true,
			},
		});
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
		await this.checkIsCompanyAdmin(user.id, companyId);

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
		file?: Express.Multer.File
	): Promise<EventEntity> {
		await this.checkIsCompanyAdmin(user.id, companyId);

		let posterUrl = this.configService.get<string>('DEFAULT_POSTER_PATH');
		if (file) {
			const posterData = await this.s3Service.uploadFile('posters', file);
			posterUrl = posterData.url;
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

	async update(
		id: number,
		dto: UpdateCompanyDto,
		user: User
	): Promise<CompanyEntity> {
		await this.checkIsCompanyAdmin(user.id, id);

		return this.prisma.company.update({
			data: dto,
			where: {
				id,
			},
		});
	}

	async updateCompanyMemberRole(
		companyId: number,
		targetUserId: number,
		{ role }: UpdateCompanyMemberRoleDto,
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
		file?: Express.Multer.File
	): Promise<EventEntity> {
		await this.checkIsCompanyAdmin(user.id, companyId);
		const event = await this.eventService.findById(eventId);
		let posterUrl = event.poster;

		if (file) {
			if (
				event.poster !== this.configService.get<string>('DEFAULT_POSTER_PATH')
			) {
				await this.s3Service.deleteFile(event.poster);
			}

			const posterData = await this.s3Service.uploadFile('posters', file);
			posterUrl = posterData.url;
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

			const jobId = `event-${eventId}`;
			const job = (await this.publishQueue.getJob(
				jobId
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
		await this.checkIsCompanyAdmin(user.id, id);

		await this.prisma.company.delete({ where: { id } });
	}

	async removeCompanyMember(
		companyId: number,
		targetUserId: number,
		user: User
	): Promise<void> {
		const company = await this.findById(companyId);

		const currentUserMembership = company.users?.find(
			(u) => u.userId === user.id
		);

		if (
			currentUserMembership?.role !== CompanyRole.ADMIN &&
			user.id !== targetUserId
		) {
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

	async removeEvent(
		companyId: number,
		eventId: number,
		user: User
	): Promise<void> {
		await this.checkIsCompanyAdmin(user.id, companyId);
		const event = await this.eventService.findById(eventId);

		if (
			event.poster !== this.configService.get<string>('DEFAULT_POSTER_PATH')
		) {
			await this.s3Service.deleteFile(event.poster);
		}

		await this.prisma.$transaction(async (prisma) => {
			await prisma.event.delete({ where: { id: eventId } });

			const jobId = `event-${eventId}`;
			const job = (await this.publishQueue.getJob(
				jobId
			)) as Job<PublishEventJobData>;

			if (job) {
				await job.remove();
			}
		});
	}

	async checkIsCompanyAdmin(userId: number, companyId: number): Promise<void> {
		const company = await this.findById(companyId);

		const membership = company.users?.find((u) => u.userId === userId);

		if (membership?.role !== CompanyRole.ADMIN) {
			throw new ForbiddenException('Access denied');
		}
	}
}
