import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class CompanySubscriptionFilteringOptionsDto {
	@ApiProperty({
		type: Number,
		example: 1,
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	readonly userId?: number;

	@ApiProperty({
		type: Number,
		example: 1,
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	readonly companyId?: number;
}
