import { User } from '@prisma/client';
import { NotificationChannel } from '../interfaces/notification-channel.interface';
import { Notification } from '../interfaces/notification.interface';
import { Injectable } from '@nestjs/common';
import { MailService } from '@modules/mail/mail.service';

@Injectable()
export class MailChannel implements NotificationChannel {
	constructor(private readonly mailService: MailService) {}

	async send(notifiable: User, notification: Notification): Promise<void> {
		if (notification.toMail) {
			await this.mailService.sendMail({
				to: notifiable.email,
				...notification.toMail(),
			});
		}
	}
}
