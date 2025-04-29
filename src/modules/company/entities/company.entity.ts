import { ApiProperty } from '@nestjs/swagger';
import { CompanyMemberEntity } from './company-member.entity';
import { Exclude } from 'class-transformer';

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
		example: 'acct_1RH07qEsghv2SxON',
		type: String,
	})
	@Exclude()
	stripeAccountId?: string | null;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	createdAt: Date;

	@ApiProperty({
		type: Number,
		example: 4.5,
	})
	rating: number;

	@ApiProperty({
		type: Number,
		example: 128,
	})
	reviews: number;

	users?: CompanyMemberEntity[];

	constructor(partial: Partial<CompanyEntity>) {
		Object.assign(this, partial);

		if (partial?.users?.length) {
			this.users = partial.users.map((user) => new CompanyMemberEntity(user));
		}
	}
}
