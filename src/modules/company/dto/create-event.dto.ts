import { ApiProperty } from '@nestjs/swagger';
import { Format, Prisma, Theme, VisitorsVisibility } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
	IsEnum,
	IsInt,
	IsISO8601,
	IsNotEmpty,
	IsOptional,
	IsString,
	Min,
	Validate,
} from 'class-validator';
import { AfterDateValidator } from '../validators/after-date.validator';

export class CreateEventDto {
	@ApiProperty({
		type: String,
		example: 'Tech Conference',
	})
	@IsNotEmpty()
	@IsString()
	title: string;

	@ApiProperty({
		example: 'About event...',
		type: String,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		type: String,
		enum: Format,
		example: Format.CONFERENCE,
	})
	@IsEnum(Format)
	format: Format;

	@ApiProperty({
		type: String,
		enum: Theme,
		example: Theme.BUSINESS,
	})
	@IsEnum(Theme)
	theme: Theme;

	@ApiProperty({
		example: 'United States Minnesota 46702 Jaydon Plains',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	location: string;

	@ApiProperty({
		example: 19.25,
		type: Prisma.Decimal,
	})
	@IsNotEmpty()
	@Transform(({ value }) => new Prisma.Decimal(value).toNumber())
	@Type(() => Prisma.Decimal)
	@Min(0)
	ticketPrice: Prisma.Decimal;

	@ApiProperty({
		example: 100,
		type: Number,
	})
	@IsNotEmpty()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(0)
	ticketsQuantity: number;

	@ApiProperty({
		type: String,
		enum: VisitorsVisibility,
		example: VisitorsVisibility.EVERYONE,
	})
	@IsEnum(VisitorsVisibility)
	visitorsVisibility: VisitorsVisibility;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	@IsISO8601({
		strict: true,
	})
	startDate: Date;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	@IsOptional()
	@IsISO8601({
		strict: true,
	})
	@Validate(AfterDateValidator)
	endDate?: Date;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	@IsOptional()
	@IsISO8601({
		strict: true,
	})
	@Validate(AfterDateValidator)
	publishDate?: Date;
}
