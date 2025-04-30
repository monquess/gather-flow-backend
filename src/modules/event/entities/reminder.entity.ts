import { ApiProperty } from '@nestjs/swagger';

export class ReminderEntity {
	@ApiProperty({
		type: Number,
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	eventId: number;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	userId: number;

	@ApiProperty({
		type: Date,
		format: 'date-time',
		example: '2025-03-09T16:30:00.000Z',
	})
	time: Date;
}
