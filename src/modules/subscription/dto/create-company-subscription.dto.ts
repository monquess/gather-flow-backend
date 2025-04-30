import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateCompanySubscriptionDto {
	@ApiProperty({
		type: Number,
		example: 1,
		required: true,
	})
	@IsNotEmpty()
	@IsInt()
	readonly companyId: number;
}
