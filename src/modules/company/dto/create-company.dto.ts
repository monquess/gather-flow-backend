import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
	@ApiProperty({
		type: String,
		example: 'Monquess',
	})
	@IsNotEmpty()
	@IsString()
	readonly name: string;

	@ApiProperty({
		example: 'About company...',
		type: String,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		type: String,
		format: 'email',
		example: 'johndoe123@gmail.com',
	})
	@IsNotEmpty()
	@IsEmail()
	readonly email: string;

	@ApiProperty({
		example: 'United States Minnesota 46702 Jaydon Plains',
		type: String,
	})
	@IsOptional()
	@IsString()
	location: string;
}
