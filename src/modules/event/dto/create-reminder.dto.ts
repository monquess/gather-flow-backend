import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, Validate } from 'class-validator';
import { FutureDateValidator } from '../validators/future-date.validator';

export class CreateReminderDto {
	@ApiProperty({
		type: String,
		format: 'date-time',
		example: '2025-03-09T17:45:00.000Z',
	})
	@IsISO8601({
		strict: true,
	})
	@Validate(FutureDateValidator)
	time: string;
}
