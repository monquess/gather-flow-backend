import { User } from '@prisma/client';
import { Notification } from './notification.interface';

export interface NotificationChannel {
	send(notifiable: User, notification: Notification): Promise<void>;
}
