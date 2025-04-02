import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
	@ApiProperty({
		type: String,
		format: 'email',
		example: 'johndoe@example.com',
	})
	@IsEmail()
	@Transform(({ value }: { value: string }) => value.toLowerCase())
	readonly email: string;

	@ApiProperty({
		type: String,
		minLength: 6,
		maxLength: 6,
		example: 'c1aa5as',
	})
	@Length(6, 6, {
		message: 'Invalid token',
	})
	@Transform(({ value }: { value: string }) => value.toLowerCase())
	readonly token: string;

	@ApiProperty({
		type: String,
		format: 'password',
		example: 'securepassword',
	})
	@IsString()
	@IsNotEmpty()
	readonly password: string;
}
