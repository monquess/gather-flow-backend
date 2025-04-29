import { MailChannel } from '../channels/mail.channel';
import { Notification } from '../interfaces/notification.interface';

export class NewEventNotification implements Notification {
	constructor(private readonly context?: Record<string, unknown>) {}

	channels() {
		return [MailChannel];
	}

	toMail() {
		return {
			subject: 'New Event',
			templateName: 'new-event',
			context: this?.context,
		};
	}

	toObject() {
		return this.context;
	}
}
