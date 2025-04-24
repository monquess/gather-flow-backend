import { ApiProperty } from '@nestjs/swagger';

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
		type: Number,
		example: 1,
	})
	authorId: number;

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
	})
	hasReplies?: boolean;

	constructor(partial: Partial<CommentEntity>) {
		Object.assign(this, partial);
	}
}
