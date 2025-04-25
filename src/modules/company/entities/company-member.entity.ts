import { UserEntity } from '@modules/user/entities/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { CompanyRole } from '@prisma/client';

export class CompanyMemberEntity {
	@ApiProperty({
		type: PickType(UserEntity, ['id', 'username', 'avatar']),
		example: {
			id: 1,
			username: 'johndoe123',
			avatar: 'https://s3.com/avatars/default.webp',
		},
	})
	user: Pick<UserEntity, 'id' | 'username' | 'avatar'>;

	@ApiProperty({
		type: String,
		enum: CompanyRole,
		example: CompanyRole.MEMBER,
	})
	role: CompanyRole;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	createdAt: Date;

	constructor(partial: Partial<CompanyMemberEntity>) {
		Object.assign(this, partial);
	}
}
