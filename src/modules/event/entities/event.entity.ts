import { Transform } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Prisma, Format, Theme, VisitorsVisibility } from '@prisma/client';
import { CompanyEntity } from '@modules/company/entities/company.entity';

export class EventEntity {
	@ApiProperty({
		type: Number,
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: PickType(CompanyEntity, ['id', 'name']),
		example: {
			id: 1,
			name: 'Monquess',
		},
		required: false,
	})
	company?: Pick<CompanyEntity, 'id' | 'name'>;

	@ApiProperty({
		type: String,
		example: 'Tech Conference',
	})
	title: string;

	@ApiProperty({
		type: String,
		example: 'About event...',
		nullable: true,
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
		type: String,
		example: 'United States Minnesota 46702 Jaydon Plains',
	})
	location: string;

	@ApiProperty({
		type: Number,
		example: 19.25,
	})
	@Transform(({ value }: { value: unknown }) => {
		if (typeof value === 'string') {
			return parseFloat(value);
		}
		return value instanceof Prisma.Decimal ? value.toNumber() : value;
	})
	ticketPrice: Prisma.Decimal;

	@ApiProperty({
		type: Number,
		example: 100,
	})
	ticketsQuantity: number;

	@ApiProperty({
		type: Number,
		example: 100,
	})
	ticketsSold: number;

	@ApiProperty({
		type: String,
		example: 'https://s3.com/posters/default.webp',
	})
	poster: string;

	@ApiProperty({
		type: String,
		enum: VisitorsVisibility,
		example: VisitorsVisibility.EVERYONE,
	})
	visitorsVisibility: VisitorsVisibility;

	@ApiProperty({
		type: String,
		format: 'date-time',
		example: '2025-03-09T16:17:53.019Z',
	})
	startDate: Date;

	@ApiProperty({
		type: String,
		format: 'date-time',
		example: '2025-03-09T16:17:53.019Z',
		nullable: true,
	})
	endDate?: Date | null;

	@ApiProperty({
		type: String,
		format: 'date-time',
		example: '2025-03-09T16:17:53.019Z',
		nullable: true,
	})
	publishDate?: Date | null;

	@ApiProperty({
		type: String,
		format: 'date-time',
		example: '2025-03-09T16:17:53.019Z',
	})
	createdAt: Date;

	constructor(partial: Partial<EventEntity>) {
		Object.assign(this, partial);
	}
}
