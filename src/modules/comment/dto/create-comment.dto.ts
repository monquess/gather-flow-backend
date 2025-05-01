import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
	@ApiProperty({
		type: String,
		example: 'Great event!',
	})
	@IsString()
	@IsNotEmpty()
	content: string;
}
