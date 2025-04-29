import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
	message: string;
	type: NotificationType;
}
