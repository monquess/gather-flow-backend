import { Notification } from './interfaces/notification.interface';

export const NotificationRegistry: Record<
	string,
	new (props: any) => Notification
> = {};
