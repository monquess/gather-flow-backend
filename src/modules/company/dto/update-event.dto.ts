import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { EventStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateEventDto extends PartialType(
	OmitType(CreateEventDto, ['promocodes'])
) {
	@ApiProperty({
		type: String,
		enum: EventStatus,
		example: EventStatus.PUBLISHED,
		required: false,
	})
	@IsOptional()
	@IsEnum(EventStatus)
	readonly status?: EventStatus;
}
