import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdatePromocodeDto {
	@ApiProperty({
		example: true,
		type: Boolean,
	})
	@IsOptional()
	@IsOptional()
	isActive?: boolean;
}
