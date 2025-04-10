import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTicketDto {
	@ApiProperty({
		example: 100,
		type: Number,
	})
	@IsNotEmpty()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(0)
	quantity: number;

	@ApiProperty({
		example: 'V1StGXR8_Z5jdHi6B-myT',
		type: String,
	})
	@IsOptional()
	@IsString()
	promocode?: string;
}
