import { ApiProperty } from '@nestjs/swagger';
import { Format, Theme, VisitorsVisibility } from '@prisma/client';
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

	@IsOptional()
	@IsEnum(Format)
	format?: Format;

	@IsOptional()
	@IsEnum(Theme)
	theme?: Theme;

	@IsOptional()
	@IsEnum(VisitorsVisibility)
	visitorsVisibility?: VisitorsVisibility;

	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	companyId?: number;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	startDate?: Date;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	endDate?: Date;
}
