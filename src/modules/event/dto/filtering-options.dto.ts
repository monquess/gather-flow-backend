import { ApiProperty } from '@nestjs/swagger';
import { EventStatus, Format, Theme } from '@prisma/client';
import { Type } from 'class-transformer';
import {
	IsDate,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';

export class FilteringOptionsDto {
	@ApiProperty({
		type: String,
		example: 'Tech conference',
		required: false,
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	readonly query?: string;

	@ApiProperty({
		type: String,
		enum: Format,
		example: Format.CONFERENCE,
		required: false,
	})
	@IsOptional()
	@IsEnum(Format)
	readonly format?: Format;

	@ApiProperty({
		type: String,
		enum: Theme,
		example: Theme.BUSINESS,
		required: false,
	})
	@IsOptional()
	@IsEnum(Theme)
	readonly theme?: Theme;

	@ApiProperty({
		type: String,
		enum: EventStatus,
		example: EventStatus.PUBLISHED,
		required: false,
	})
	@IsOptional()
	@IsEnum(EventStatus)
	readonly status?: EventStatus;

	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	readonly companyId?: number;

	@ApiProperty({
		type: String,
		format: 'date-time',
		example: '2024-03-17T16:00:00.000Z',
		required: false,
	})
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	readonly startDate?: Date;

	@ApiProperty({
		type: String,
		format: 'date-time',
		example: '2024-03-17T18:30:00.000Z',
		required: false,
	})
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	readonly endDate?: Date;
}
