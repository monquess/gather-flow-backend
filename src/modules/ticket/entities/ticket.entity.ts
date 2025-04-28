import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class TicketEntity {
	@ApiProperty({
		example: 1,
		type: Number,
	})
	id: number;

	@ApiProperty({
		example: 1,
		type: Number,
	})
	userId: number;

	@ApiProperty({
		example: 1,
		type: Number,
	})
	eventId: number;

	@ApiProperty({
		example: 'V1StGXR8_Z5jdHi6B-myT',
		type: String,
	})
	ticketCode: string;

	@ApiProperty({
		example: 'V1StGXR8_Z5jdHi6B-myT',
		type: String,
	})
	promocodeUsed?: string | null;

	@ApiProperty({
		example: 19.25,
		type: Prisma.Decimal,
	})
	finalPrice: Prisma.Decimal;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	purchaseDate: Date;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	createdAt: Date;

	constructor(partial: Partial<TicketEntity>) {
		Object.assign(this, partial);
	}
}
