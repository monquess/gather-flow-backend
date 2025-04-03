import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class CreateCompanyMemberDto {
	@ApiProperty({
		example: 'MEMBER',
		type: String,
		enum: CompanyRole,
	})
	@IsOptional()
	@IsEnum(CompanyRole)
	role?: CompanyRole;
}
