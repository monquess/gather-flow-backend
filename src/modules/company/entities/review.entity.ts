import { ApiProperty } from '@nestjs/swagger';

export class ReviewEntity {
	@ApiProperty({
		type: Number,
		example: 1,
	})
	companyId: number;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	authorId: number;

	@ApiProperty({
		type: Number,
		minimum: 1,
		maximum: 5,
		example: 4,
	})
	stars: number;

	@ApiProperty({
		type: String,
		example: 'Great event organization and communication with users!',
		nullable: true,
		required: false,
	})
	comment: string | null;

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
}
