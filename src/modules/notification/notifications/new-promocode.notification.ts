import { NotificationType } from '@prisma/client';
import { MailChannel } from '../channels/mail.channel';
import { Notification } from '../interfaces/notification.interface';
import { DatabaseChannel } from '../channels/database.channel';

interface NewPromocodeNotificationContext extends Record<string, unknown> {
	companyName: string;
	promocodeCode: string;
	promocodeDiscount: number;
	eventTitle: string;
}

export class NewPromocodeNotification implements Notification {
	constructor(private readonly context: NewPromocodeNotificationContext) {}

	channels() {
		return [MailChannel, DatabaseChannel];
	}

	toMail() {
		return {
			subject: 'New Promocode',
			templateName: 'new-promocode',
			context: this.context,
		};
	}

	toDatabase() {
		return {
			message: `Company ${this.context.companyName} created new promocode: ${this.context.promocodeCode} with discount ${this.context.promocodeDiscount}% for event ${this.context.eventTitle}.`,
			type: NotificationType.NEW_PROMOCODE,
		};
	}

	toObject() {
		return this.context;
	}
}
