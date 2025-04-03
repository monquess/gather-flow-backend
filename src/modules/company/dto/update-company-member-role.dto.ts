import { PickType } from '@nestjs/swagger';
import { CreateCompanyMemberDto } from './create-company-member.dto';

export class UpdateCompanyMemberRoleDto extends PickType(
	CreateCompanyMemberDto,
	['role']
) {}
