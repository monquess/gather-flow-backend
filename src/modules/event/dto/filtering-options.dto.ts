import { ApiProperty } from '@nestjs/swagger';
import { Format, Theme } from '@prisma/client';
import { Type } from 'class-transformer';
import {
	IsDate,
	IsEnum,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';

export class FilteringOptionsDto {
	@ApiProperty({
		type: String,
		example: 'Tech Conference',
	})
	@IsOptional()
	@IsString()
	title?: string;

	@ApiProperty({
		example: 'CONFERENCE',
		type: String,
		enum: Format,
	})
	@IsOptional()
	@IsEnum(Format)
	format?: Format;

	@ApiProperty({
		example: 'BUSINESS',
		type: String,
		enum: Theme,
	})
	@IsOptional()
	@IsEnum(Theme)
	theme?: Theme;

	@ApiProperty({
		example: 1,
		type: Number,
	})
	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	companyId?: number;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	startDate?: Date;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	endDate?: Date;
}
