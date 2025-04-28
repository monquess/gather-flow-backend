import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
	@ApiProperty({
		type: String,
		example: 'Monquess',
	})
	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@ApiProperty({
		type: String,
		example: 'About company...',
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	readonly description?: string;

	@ApiProperty({
		type: String,
		format: 'email',
		example: 'johndoe123@gmail.com',
	})
	@IsEmail()
	readonly email: string;

	@ApiProperty({
		type: String,
		example: 'United States Minnesota 46702 Jaydon Plains',
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	readonly location: string;
}
