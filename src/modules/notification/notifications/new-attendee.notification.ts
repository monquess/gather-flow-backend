import { NotificationType } from '@prisma/client';
import { MailChannel } from '../channels/mail.channel';
import { Notification } from '../interfaces/notification.interface';
import { DatabaseChannel } from '../channels/database.channel';

interface NewAttendeeNotificationContext extends Record<string, unknown> {
	eventTitle: string;
}

export class NewAttendeeNotification implements Notification {
	constructor(private readonly context: NewAttendeeNotificationContext) {}

	channels() {
		return [MailChannel, DatabaseChannel];
	}

	toMail() {
		return {
			subject: 'New Attendee',
			templateName: 'new-attendee',
			context: this.context,
		};
	}

	toDatabase() {
		return {
			message: `You have a new attendee for event ${this.context.eventTitle}.`,
			type: NotificationType.NEW_ATTENDEE,
		};
	}

	toObject() {
		return this.context;
	}
}
