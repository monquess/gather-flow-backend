import { ApiProperty } from '@nestjs/swagger';
import { Format, Theme } from '@prisma/client';

import { Transform, Type } from 'class-transformer';
import {
	IsDate,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';

export class EventFilteringOptionsDto {
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
		isArray: true,
		enum: Format,
		example: [Format.CONFERENCE, Format.LECTURE],
		required: false,
	})
	@IsOptional()
	@IsEnum(Format, { each: true })
	@Transform(({ value }: { value: Format }) => {
		return Array.isArray(value) ? value : [value];
	})
	readonly format?: Format;

	@ApiProperty({
		type: String,
		enum: Theme,
		isArray: true,
		example: [Theme.BUSINESS, Theme.OTHER],
		required: false,
	})
	@IsOptional()
	@IsEnum(Theme, { each: true })
	@Transform(({ value }: { value: Theme }) => {
		return Array.isArray(value) ? value : [value];
	})
	readonly theme?: Theme;

	@ApiProperty({
		type: Number,
		example: 19.25,
		required: false,
	})
	@IsOptional()
	@IsPositive()
	@IsNumber({ maxDecimalPlaces: 2 })
	@Type(() => Number)
	readonly minPrice?: number;

	@ApiProperty({
		type: Number,
		example: 150.0,
		required: false,
	})
	@IsOptional()
	@IsNumber({ maxDecimalPlaces: 2 })
	@IsPositive()
	@Type(() => Number)
	readonly maxPrice?: number;

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
