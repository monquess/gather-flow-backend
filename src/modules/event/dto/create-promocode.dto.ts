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

export class CreatePromocodeDto {
	@ApiProperty({
		example: 'SUMMER2023',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	code: string;

	@ApiProperty({
		example: 20,
		type: Number,
	})
	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Max(100)
	discount: number;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	@IsISO8601({
		strict: true,
	})
	@Validate(FutureDateValidator)
	expirationDate: Date;
}
