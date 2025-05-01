import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CompanyFilteringOptionsDto {
	@ApiProperty({
		type: String,
		example: 'Monquess',
		required: false,
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	readonly name?: string;

	@ApiProperty({
		type: Number,
		example: 1,
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	readonly userId?: number;
}
