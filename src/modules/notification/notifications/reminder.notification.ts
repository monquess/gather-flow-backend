import { NotificationType } from '@prisma/client';
import { DatabaseChannel } from '../channels/database.channel';
import { MailChannel } from '../channels/mail.channel';
import { Notification } from '../interfaces/notification.interface';

interface ReminderNotificationContext extends Record<string, unknown> {
	reminderId: number;
	username: string;
	eventTitle: string;
	eventDate: string;
}

export class ReminderNotification implements Notification {
	constructor(private readonly context: ReminderNotificationContext) {}

	channels() {
		return [MailChannel, DatabaseChannel];
	}

	toMail() {
		return {
			subject: 'Event reminder',
			templateName: 'reminder',
			context: this.context,
		};
	}

	toDatabase() {
		return {
			message: `Reminder for an upcoming event: ${this.context.eventTitle} on ${this.context.eventDate}.`,
			type: NotificationType.EVENT_REMINDER,
		};
	}

	toObject() {
		return this.context;
	}
}
