import { ApiProperty } from '@nestjs/swagger';
import { Format, Prisma, Theme, VisitorsVisibility } from '@prisma/client';

export class EventEntity {
	@ApiProperty({
		example: 1,
		type: Number,
	})
	id: number;

	@ApiProperty({
		example: 1,
		type: Number,
	})
	companyId: number;

	@ApiProperty({
		example: 'Tech Conference',
		type: String,
	})
	title: string;

	@ApiProperty({
		example: 'About event...',
		type: String,
	})
	description?: string | null;

	@ApiProperty({
		type: String,
		enum: Format,
		example: Format.CONFERENCE,
	})
	format: Format;

	@ApiProperty({
		type: String,
		enum: Theme,
		example: Theme.BUSINESS,
	})
	theme: Theme;

	@ApiProperty({
		example: 'United States Minnesota 46702 Jaydon Plains',
		type: String,
	})
	location: string;

	@ApiProperty({
		example: 19.25,
		type: Prisma.Decimal,
	})
	ticketPrice: Prisma.Decimal;

	@ApiProperty({
		example: 100,
		type: Number,
	})
	ticketsQuantity: number;

	@ApiProperty({
		example: 100,
		type: Number,
	})
	ticketsSold: number;

	@ApiProperty({
		example: 'https://s3.com/avatars/default.webp',
		type: String,
	})
	poster: string;

	@ApiProperty({
		type: String,
		enum: VisitorsVisibility,
		example: VisitorsVisibility.EVERYONE,
	})
	visitorsVisibility: VisitorsVisibility;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	startDate: Date;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	endDate?: Date | null;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	publishDate?: Date | null;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	createdAt: Date;

	constructor(partial: Partial<EventEntity>) {
		Object.assign(this, partial);
	}
}
