import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateCompanySubscriptionDto {
	@ApiProperty({
		type: Number,
		example: 1,
		required: true,
	})
	@IsNotEmpty()
	@Transform(({ value }) => Number(value))
	@IsInt()
	readonly companyId: number;
}
