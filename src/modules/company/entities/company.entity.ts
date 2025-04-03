import { ApiProperty } from '@nestjs/swagger';

export class CompanyEntity {
	@ApiProperty({
		example: 1,
		type: Number,
	})
	id: number;

	@ApiProperty({
		example: 'Monquess',
		type: String,
	})
	name: string;

	@ApiProperty({
		example: 'About company...',
		type: String,
	})
	description?: string | null;

	@ApiProperty({
		example: 'johndoe123@gmail.com',
		type: String,
	})
	email: string;

	@ApiProperty({
		example: 'United States Minnesota 46702 Jaydon Plains',
		type: String,
	})
	location: string;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	createdAt: Date;

	constructor(partial: Partial<CompanyEntity>) {
		Object.assign(this, partial);
	}
}
