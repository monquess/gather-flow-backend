import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { IsOptional, IsEnum } from 'class-validator';
import { EventFilteringOptionsDto } from '@modules/event/dto/filtering-options.dto';

export class CompanyEventFilteringOptionsDto extends EventFilteringOptionsDto {
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
