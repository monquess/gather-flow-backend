import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { UserModule } from '@modules/user/user.module';
import { S3Module } from '@modules/s3/s3.module';
import { EventModule } from '@modules/event/event.module';

@Module({
	imports: [PrismaModule, UserModule, S3Module, EventModule],
	controllers: [CompanyController],
	providers: [CompanyService],
})
export class CompanyModule {}
