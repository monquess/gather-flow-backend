import { UserEntity } from '@modules/user/entities/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class CommentEntity {
	@ApiProperty({
		type: Number,
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: String,
		example: 'Great event!',
	})
	content: string;

	@ApiProperty({
		type: PickType(UserEntity, ['id', 'username', 'avatar']),
		example: {
			id: 1,
			username: 'johndoe123',
			avatar: 'https://s3.com/avatars/default.webp',
		},
	})
	author: Pick<UserEntity, 'id' | 'username' | 'avatar'>;

	@ApiProperty({
		type: String,
		example: '2025-03-09T16:17:53.019Z',
	})
	createdAt: Date;

	@ApiProperty({
		type: String,
		example: '2025-03-09T16:17:53.019Z',
	})
	updatedAt: Date;

	@ApiProperty({
		type: Boolean,
		example: true,
		required: false,
	})
	hasReplies?: boolean;

	constructor(partial: Partial<CommentEntity>) {
		Object.assign(this, partial);
	}
}
