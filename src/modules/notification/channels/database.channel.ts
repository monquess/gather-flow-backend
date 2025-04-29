import { User } from '@prisma/client';
import { NotificationChannel } from '../interfaces/notification-channel.interface';
import { Notification } from '../interfaces/notification.interface';
import { Injectable } from '@nestjs/common';
import { NotificationService } from '../notification.service';

@Injectable()
export class DatabaseChannel implements NotificationChannel {
	constructor(private readonly notificationService: NotificationService) {}

	async send(notifiable: User, notification: Notification): Promise<void> {
		if (notification.toDatabase) {
			await this.notificationService.create(notification.toDatabase(), notifiable);
		}
	}
}
