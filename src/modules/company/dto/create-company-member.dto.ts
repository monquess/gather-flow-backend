import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class CreateCompanyMemberDto {
	@ApiProperty({
		type: String,
		enum: CompanyRole,
		example: CompanyRole.MEMBER,
	})
	@IsOptional()
	@IsEnum(CompanyRole)
	readonly role?: CompanyRole;
}
