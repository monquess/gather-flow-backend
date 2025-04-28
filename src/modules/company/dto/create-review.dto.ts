import { ApiProperty } from '@nestjs/swagger';
import {
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	Max,
	MaxLength,
} from 'class-validator';

export class CreateReviewDto {
	@ApiProperty({
		type: Number,
		minimum: 1,
		maximum: 5,
		example: 4,
	})
	@IsInt()
	@IsPositive()
	@Max(5)
	stars: number;

	@ApiProperty({
		type: String,
		example: 'Great event organization and communication with users!',
		required: false,
	})
	@IsOptional()
	@IsNotEmpty()
	@MaxLength(500)
	comment?: string;
}
