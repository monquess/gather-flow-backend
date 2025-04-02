import { UserEntity } from '@modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
	@ApiProperty({
		type: UserEntity,
	})
	user: UserEntity;

	@ApiProperty({
		type: String,
	})
	accessToken: string;
}
