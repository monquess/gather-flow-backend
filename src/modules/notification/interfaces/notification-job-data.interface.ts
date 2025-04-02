import { User } from '@prisma/client';

export interface NotificationJobData {
	channel: string;
	notifiable: User;
	notification: {
		className: string;
		properties: any;
	};
}
