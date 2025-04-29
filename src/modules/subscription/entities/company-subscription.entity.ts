import { UserEntity } from '@modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CompanySubscriptionEntity {
	@ApiProperty({
		type: Number,
		example: 1,
	})
	userId: number;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	companyId: number;

	@ApiProperty({
		type: String,
		example: '2025-03-09T16:17:53.019Z',
	})
	createdAt: Date;

	user?: UserEntity;

	constructor(partial: Partial<CompanySubscriptionEntity>) {
		Object.assign(this, partial);

		this.user = partial.user ? new UserEntity(partial.user) : undefined;
	}
}
