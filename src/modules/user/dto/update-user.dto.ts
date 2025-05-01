import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateUserDto extends PartialType(
	OmitType(CreateUserDto, ['password'] as const)
) {
	@ApiProperty({
		example: true,
		type: Boolean,
	})
	@IsOptional()
	@IsBoolean()
	@Expose()
	readonly showAsAttendee?: boolean;
}
