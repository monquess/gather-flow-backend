import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FilteringOptionsDto {
	@ApiProperty({
		type: String,
		example: 'Monquess',
		required: false,
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	readonly name?: string;
}
