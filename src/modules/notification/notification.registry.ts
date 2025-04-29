import { Notification } from './interfaces/notification.interface';
import { NewEventNotification } from './notifications/new-event.notification';
import { NewPostNotification } from './notifications/new-post.notification';
import { NewPromocodeNotification } from './notifications/new-promocode.notification';
import { ReminderNotification } from './notifications/reminder.notification';

export const NotificationRegistry: Record<string, new (props: any) => Notification> = {
	NewEventNotification,
	NewPostNotification,
	NewPromocodeNotification,
	ReminderNotification,
};
