import { ApiProperty } from '@nestjs/swagger';
import { Provider } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity {
	@ApiProperty({
		example: 1,
		type: Number,
	})
	id: number;

	@ApiProperty({
		example: 'johndoe123',
		type: String,
	})
	username: string;

	@ApiProperty({
		example: 'johndoe123@gmail.com',
		type: String,
	})
	email: string;

	@Exclude()
	password: string | null;

	@Exclude()
	country?: string;

	@Exclude()
	timezone?: string;

	@Exclude()
	provider: Provider;

	@ApiProperty({
		example: true,
		type: Boolean,
	})
	verified: boolean;

	@ApiProperty({
		example: 'https://s3.com/avatars/default.webp',
		type: String,
	})
	avatar: string;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	createdAt: Date;

	@ApiProperty({
		example: '2025-03-09T16:18:14.889Z',
		type: String,
	})
	updatedAt: Date;

	constructor(partial: Partial<UserEntity>) {
		Object.assign(this, partial);
	}
}
