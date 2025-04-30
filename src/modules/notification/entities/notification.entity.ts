import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationEntity {
	@ApiProperty({
		type: Number,
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	userId: number;

	@ApiProperty({
		type: String,
		example: 'New event...',
	})
	message: string;

	@ApiProperty({
		type: Boolean,
		example: false,
	})
	isRead: boolean;

	@ApiProperty({
		type: String,
		enum: NotificationType,
		example: NotificationType.NEW_EVENT,
	})
	type: NotificationType;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	createdAt: Date;

	constructor(partial: Partial<NotificationEntity>) {
		Object.assign(this, partial);
	}
}
