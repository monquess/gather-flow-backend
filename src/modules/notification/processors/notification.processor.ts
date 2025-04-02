import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ModuleRef } from '@nestjs/core';
import { NotificationChannel } from '../interfaces/notification-channel.interface';
import { NotificationRegistry } from '../notification.registry';
import { NotificationJobData } from '../interfaces/notification-job-data.interface';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
	constructor(private readonly moduleRef: ModuleRef) {
		super();
	}

	async process(job: Job<NotificationJobData>): Promise<any> {
		const { channel, notifiable, notification } = job.data;

		const channelInstance = this.moduleRef.get<NotificationChannel>(channel, {
			strict: false,
		});

		if (channelInstance) {
			const NotificationClass = NotificationRegistry[notification.className];

			if (NotificationClass) {
				const notificationInstance = new NotificationClass(
					notification.properties
				);

				await channelInstance.send(notifiable, notificationInstance);
			}
		}

		return;
	}
}
