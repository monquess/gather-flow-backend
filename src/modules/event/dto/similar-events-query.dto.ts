import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class SimilarEventsQueryDto {
	@ApiProperty({
		type: Number,
		example: 5,
		required: false,
		default: 5,
	})
	@IsInt()
	@IsOptional()
	limit: number = 5;
}
