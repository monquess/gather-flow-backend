import { MailChannel } from '../channels/mail.channel';
import { Notification } from '../interfaces/notification.interface';

export class NewPromocodeNotification implements Notification {
	constructor(private readonly context?: Record<string, unknown>) {}

	channels() {
		return [MailChannel];
	}

	toMail() {
		return {
			subject: 'New Promocode',
			templateName: 'new-promocode',
			context: this?.context,
		};
	}

	toObject() {
		return this.context;
	}
}
