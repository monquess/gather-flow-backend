import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from '@prisma/client';

export class CompanyMemberEntity {
	@ApiProperty({
		example: 1,
		type: Number,
	})
	userId: number;

	@ApiProperty({
		example: 1,
		type: Number,
	})
	companyId: number;

	@ApiProperty({
		type: String,
		enum: CompanyRole,
		example: CompanyRole.MEMBER,
	})
	role: CompanyRole;

	@ApiProperty({
		example: '2025-03-09T16:17:53.019Z',
		type: String,
	})
	createdAt: Date;

	constructor(partial: Partial<CompanyMemberEntity>) {
		Object.assign(this, partial);
	}
}
