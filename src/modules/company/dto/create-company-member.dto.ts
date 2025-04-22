import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class CreateCompanyMemberDto {
	@ApiProperty({
		example: 'MEMBER',
		type: String,
		enum: CompanyRole,
	})
	@Transform(({ value }) => {
		if (typeof value === 'string') {
			return value.toUpperCase();
		}
	})
	@IsEnum(CompanyRole)
	@IsOptional()
	role?: CompanyRole;
}
