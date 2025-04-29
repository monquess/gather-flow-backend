import { MailChannel } from '../channels/mail.channel';
import { Notification } from '../interfaces/notification.interface';

export class NewPostNotification implements Notification {
	constructor(private readonly context?: Record<string, unknown>) {}

	channels() {
		return [MailChannel];
	}

	toMail() {
		return {
			subject: 'New Post',
			templateName: 'new-post',
			context: this?.context,
		};
	}

	toObject() {
		return this.context;
	}
}
