import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class NotificationFilteringOptionsDto {
	@ApiProperty({
		type: Boolean,
		example: true,
		required: false,
	})
	@IsOptional()
	@IsBoolean()
	readonly isRead?: boolean;
}
