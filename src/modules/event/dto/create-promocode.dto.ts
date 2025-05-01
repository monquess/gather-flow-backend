import { ApiProperty } from '@nestjs/swagger';
import {
	IsInt,
	IsISO8601,
	IsNotEmpty,
	IsString,
	Max,
	Min,
	Validate,
} from 'class-validator';
import { FutureDateValidator } from '../validators/future-date.validator';
import { Type } from 'class-transformer';

export class CreatePromocodeDto {
	@ApiProperty({
		type: String,
		example: 'SUMMER2023',
	})
	@IsNotEmpty()
	@IsString()
	code: string;

	@ApiProperty({
		type: Number,
		example: 20,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	discount: number;

	@ApiProperty({
		type: String,
		format: 'date-time',
		example: '2025-03-09T16:17:53.019Z',
	})
	@IsISO8601({
		strict: true,
	})
	@Validate(FutureDateValidator)
	expirationDate: Date;
}
