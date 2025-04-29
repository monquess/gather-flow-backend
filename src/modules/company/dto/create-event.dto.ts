import { ApiProperty } from '@nestjs/swagger';
import { Format, Prisma, Theme, VisitorsVisibility } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
	IsArray,
	IsEnum,
	IsInt,
	IsISO8601,
	IsNotEmpty,
	IsOptional,
	IsString,
	Min,
	Validate,
	ValidateNested,
} from 'class-validator';

import { AfterDateValidator } from '../validators/after-date.validator';
import { FutureDateValidator } from '../validators/future-date.validator';
import { CreatePromocodeDto } from '@modules/event/dto';

export class CreateEventDto {
	@ApiProperty({
		type: String,
		example: 'Tech Conference',
	})
	@IsString()
	@IsNotEmpty()
	readonly title: string;

	@ApiProperty({
		type: String,
		example: 'About event...',
		required: false,
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	readonly description?: string;

	@ApiProperty({
		type: String,
		enum: Format,
		example: Format.CONFERENCE,
	})
	@IsEnum(Format)
	readonly format: Format;

	@ApiProperty({
		type: String,
		enum: Theme,
		example: Theme.BUSINESS,
	})
	@IsEnum(Theme)
	readonly theme: Theme;

	@ApiProperty({
		type: String,
		example: 'United States Minnesota 46702 Jaydon Plains',
	})
	@IsString()
	@IsNotEmpty()
	readonly location: string;

	@ApiProperty({
		type: Prisma.Decimal,
		example: 19.25,
	})
	@IsNotEmpty()
	@Transform(({ value }: { value: Prisma.Decimal.Value }) =>
		new Prisma.Decimal(value).toNumber()
	)
	@Type(() => Prisma.Decimal)
	@Min(0)
	readonly ticketPrice: Prisma.Decimal;

	@ApiProperty({
		type: Number,
		example: 100,
	})
	@IsNotEmpty()
	@IsInt()
	@Min(0)
	@Transform(({ value }) => Number(value))
	readonly ticketsQuantity: number;

	@ApiProperty({
		type: String,
		enum: VisitorsVisibility,
		example: VisitorsVisibility.EVERYONE,
	})
	@IsEnum(VisitorsVisibility)
	readonly visitorsVisibility: VisitorsVisibility;

	@ApiProperty({
		type: String,
		format: 'date-time',
		example: '2025-03-07T16:30:00.000Z',
	})
	@IsISO8601({
		strict: true,
	})
	readonly startDate: Date;

	@ApiProperty({
		type: String,
		format: 'date-time',
		example: '2025-03-09T16:17:53.019Z',
		required: false,
	})
	@IsOptional()
	@IsISO8601({
		strict: true,
	})
	@Validate(AfterDateValidator)
	readonly endDate?: Date;

	@ApiProperty({
		type: String,
		format: 'date-time',
		example: '2025-03-07T20:30:00.000Z',
		required: false,
	})
	@IsOptional()
	@IsISO8601({
		strict: true,
	})
	@Validate(FutureDateValidator)
	readonly publishDate?: Date;

	@ApiProperty({
		type: [CreatePromocodeDto],
		example: [
			{
				code: 'SUMMER2023',
				discount: 20,
				expirationDate: '2025-03-09T16:17:53.019Z',
			},
		],
		isArray: true,
		required: false,
	})
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreatePromocodeDto)
	readonly promocodes: CreatePromocodeDto[] = [];
}
