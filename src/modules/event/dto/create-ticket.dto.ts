import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTicketDto {
	@ApiProperty({
		type: Number,
		example: 100,
	})
	@IsNotEmpty()
	@Transform(({ value }: { value: string }) => parseInt(value))
	@IsInt()
	@Min(1)
	quantity: number;

	@ApiProperty({
		type: String,
		example: 'V1StGXR8_Z5jdHi6B-myT',
	})
	@IsOptional()
	@IsString()
	promocode?: string;
}
