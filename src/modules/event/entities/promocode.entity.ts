import { ApiProperty } from '@nestjs/swagger';

export class PromocodeEntity {
	@ApiProperty({
		example: 1,
		type: Number,
	})
	id: number;

	@ApiProperty({
		example: 1,
		type: Number,
	})
	eventId: number;

	@ApiProperty({
		example: 'DISCOUNT10',
		type: String,
	})
	code: string;

	@ApiProperty({
		example: 10,
		type: Number,
	})
	discount: number;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	expirationDate: Date;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	createdAt: Date;
}
