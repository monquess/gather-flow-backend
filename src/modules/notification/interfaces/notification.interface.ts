import { Type } from '@nestjs/common';
import { NotificationChannel } from './notification-channel.interface';
import { SendMailOptions } from '@modules/mail/interfaces/send-mail-options.interface';

export interface Notification {
	channels(): Type<NotificationChannel>[];

	toMail?(): Omit<SendMailOptions, 'to'>;

	toObject(): Record<string, unknown> | undefined;
}
