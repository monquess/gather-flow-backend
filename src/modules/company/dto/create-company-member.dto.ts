import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class CreateCompanyMemberDto {
	@ApiProperty({
		type: String,
		enum: CompanyRole,
		example: CompanyRole.MEMBER,
	})
	@Transform(({ value }) => {
		if (typeof value === 'string') {
			return value.toUpperCase();
		}
	})
	@IsEnum(CompanyRole)
	@Transform(({ value }) => {
		if (typeof value === 'string') {
			return value.toUpperCase();
		}
	})
	readonly role?: CompanyRole;
}
