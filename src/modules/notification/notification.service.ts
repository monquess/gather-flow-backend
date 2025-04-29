/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { Notification } from './interfaces/notification.interface';
import { Job, JobsOptions, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { NotificationFilteringOptionsDto } from './dto/filtering-options.dto';
import { PrismaService } from '@modules/prisma/prisma.service';
import { getPaginationMeta, Paginated, PaginationOptionsDto } from '@common/pagination';
import { NotificationEntity } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable({})
export class NotificationService {
	constructor(
		@InjectQueue('notification') private notificationQueue: Queue,
		private readonly prisma: PrismaService
	) {}

	async send(
		notifiables: User[] | User,
		notification: Notification,
		options?: JobsOptions
	) {
		notifiables = Array.isArray(notifiables) ? notifiables : [notifiables];

		for (const channel of notification.channels()) {
			for (const notifiable of notifiables) {
				await this.notificationQueue.add(
					'sendNotification',
					{
						channel: channel.name,
						notifiable,
						notification: {
							className: notification.constructor.name,
							properties: notification.toObject(),
						},
					},
					options
				);
			}
		}
	}

	async findAll(
		{ isRead }: NotificationFilteringOptionsDto,
		{ page, limit }: PaginationOptionsDto,
		user: User
	): Promise<Paginated<NotificationEntity>> {
		const where: Prisma.NotificationWhereInput = {
			userId: user.id,
			isRead,
		};

		const [notifications, count] = await this.prisma.$transaction([
			this.prisma.notification.findMany({
				where,
				take: limit,
				skip: (page - 1) * limit,
			}),
			this.prisma.notification.count({
				where,
			}),
		]);

		return {
			data: notifications,
			meta: getPaginationMeta(count, page, limit),
		};
	}

	async findById(id: number, user: User): Promise<NotificationEntity> {
		return this.prisma.notification.findFirstOrThrow({
			where: {
				id,
				userId: user.id,
			},
		});
	}

	async create(dto: CreateNotificationDto, user: User): Promise<NotificationEntity> {
		return this.prisma.notification.create({
			data: {
				userId: user.id,
				...dto,
			},
		});
	}

	async markAsRead(id: number, user: User): Promise<void> {
		await this.prisma.notification.update({
			where: {
				id,
				userId: user.id,
			},
			data: {
				isRead: true,
			},
		});
	}

	async markAsReadBulk(ids: number[], user: User): Promise<void> {
		await this.prisma.notification.updateMany({
			where: {
				id: { in: ids },
				userId: user.id,
			},
			data: {
				isRead: true,
			},
		});
	}

	async remove(id: number, user: User): Promise<void> {
		await this.prisma.notification.delete({
			where: {
				id,
				userId: user.id,
			},
		});
	}

	async removeReminder(reminderId: number) {
		const jobs = (await this.notificationQueue.getJobs(['delayed'])) as Job[];
		const jobsToDelete = jobs.filter((job) => {
			return job.data?.notification?.properties?.reminderId === reminderId;
		});

		for (const job of jobsToDelete) {
			await job.remove();
		}
	}
}
