import { Type } from '@nestjs/common';
import { NotificationChannel } from './notification-channel.interface';
import { SendMailOptions } from '@modules/mail/interfaces/send-mail-options.interface';
import { CreateNotificationDto } from '../dto/create-notification.dto';

export interface Notification {
	channels(): Type<NotificationChannel>[];

	toMail?(): Omit<SendMailOptions, 'to'>;

	toDatabase?(): CreateNotificationDto;

	toObject(): Record<string, unknown> | undefined;
}
