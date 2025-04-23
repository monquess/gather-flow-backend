import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
	@ApiProperty({
		type: String,
		example: 'Confrence announcement',
	})
	@IsString()
	@IsNotEmpty()
	readonly title: string;

	@ApiProperty({
		type: String,
		example: 'We are pleased to announce the upcoming conference...',
	})
	@IsString()
	@IsNotEmpty()
	readonly content: string;
}
