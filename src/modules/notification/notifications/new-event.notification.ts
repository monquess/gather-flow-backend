import { NotificationType } from '@prisma/client';
import { MailChannel } from '../channels/mail.channel';
import { Notification } from '../interfaces/notification.interface';
import { DatabaseChannel } from '../channels/database.channel';

interface NewEventNotificationContext extends Record<string, unknown> {
	companyName: string;
	eventTitle: string;
}

export class NewEventNotification implements Notification {
	constructor(private readonly context: NewEventNotificationContext) {}

	channels() {
		return [MailChannel, DatabaseChannel];
	}

	toMail() {
		return {
			subject: 'New Event',
			templateName: 'new-event',
			context: this.context,
		};
	}

	toDatabase() {
		return {
			message: `Company ${this.context.companyName} created new event: ${this.context.eventTitle}.`,
			type: NotificationType.NEW_EVENT,
		};
	}

	toObject() {
		return this.context;
	}
}
