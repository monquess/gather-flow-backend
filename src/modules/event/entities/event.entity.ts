import { Transform } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Prisma, Format, Theme, VisitorsVisibility } from '@prisma/client';
import { CompanyEntity } from '@modules/company/entities/company.entity';

export class EventEntity {
	@ApiProperty({
		example: 1,
		type: Number,
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
		type: Number,
	})
	@Transform(({ value }: { value: unknown }) => {
		if (typeof value === 'string') {
			return parseFloat(value);
		}
		return value instanceof Prisma.Decimal ? value.toNumber() : value;
	})
	ticketPrice: Prisma.Decimal;

	@ApiProperty({
		example: 100,
		type: Number,
	})
	ticketsQuantity: number;

	@ApiProperty({
		example: 'https://s3.com/posters/default.webp',
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
