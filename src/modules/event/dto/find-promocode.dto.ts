import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FindPromocodeDto {
	@ApiProperty({
		type: String,
		example: 'PROMO2025',
	})
	@IsNotEmpty()
	code: string;
}
