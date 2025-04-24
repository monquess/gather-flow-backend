import { ApiProperty } from '@nestjs/swagger';

export class PostEntity {
	@ApiProperty({
		type: Number,
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	companyId: number;

	@ApiProperty({
		type: String,
		example: 'Confrence announcement',
	})
	title: string;

	@ApiProperty({
		type: String,
		example: 'We are pleased to announce the upcoming conference...',
	})
	content: string;

	@ApiProperty({
		type: String,
		example: 'https://s3.com/posters/default.webp',
	})
	poster: string;

	@ApiProperty({
		type: Number,
		example: 25,
	})
	likes: number;

	@ApiProperty({
		type: Boolean,
		example: true,
	})
	liked: boolean;

	@ApiProperty({
		type: String,
		example: '2025-03-09T16:17:53.019Z',
	})
	createdAt: Date;

	@ApiProperty({
		type: String,
		example: '2025-03-12T11:18:45.011Z',
	})
	updatedAt: Date;

	constructor(partial: Partial<PostEntity>) {
		Object.assign(this, partial);
	}
}
