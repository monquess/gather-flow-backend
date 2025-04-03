import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { UserModule } from '@modules/user/user.module';

@Module({
	imports: [PrismaModule, UserModule],
	controllers: [CompanyController],
	providers: [CompanyService],
})
export class CompanyModule {}
