import { ApiProperty } from '@nestjs/swagger';
import {
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';

export class CreateCommentDto {
	@ApiProperty({
		type: String,
		example: 'Great event!',
	})
	@IsString()
	@IsNotEmpty()
	content: string;

	@ApiProperty({
		type: Number,
		example: 12,
		required: false,
	})
	@IsInt()
	@IsPositive()
	@IsOptional()
	parentId?: number;
}
