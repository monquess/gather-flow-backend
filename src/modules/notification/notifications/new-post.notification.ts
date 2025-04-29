import { NotificationType } from '@prisma/client';
import { MailChannel } from '../channels/mail.channel';
import { Notification } from '../interfaces/notification.interface';
import { DatabaseChannel } from '../channels/database.channel';

interface NewPostNotificationContext extends Record<string, unknown> {
	companyName: string;
	postTitle: string;
}

export class NewPostNotification implements Notification {
	constructor(private readonly context: NewPostNotificationContext) {}

	channels() {
		return [MailChannel, DatabaseChannel];
	}

	toMail() {
		return {
			subject: 'New Post',
			templateName: 'new-post',
			context: this.context,
		};
	}

	toDatabase() {
		return {
			message: `Company ${this.context.companyName} created new post: ${this.context.postTitle}.`,
			type: NotificationType.NEW_POST,
		};
	}

	toObject() {
		return this.context;
	}
}
