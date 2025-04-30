import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class CompanySubscriptionFilteringOptionsDto {
	@ApiProperty({
		type: Number,
		example: 1,
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly userId?: number;

	@ApiProperty({
		type: Number,
		example: 1,
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly companyId?: number;
}
