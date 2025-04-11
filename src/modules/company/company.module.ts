import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { S3Module } from '@modules/s3/s3.module';
import { EventModule } from '@modules/event/event.module';
import { BullModule } from '@nestjs/bullmq';
import { PublishEventProcessor } from './processors/publish-event.processor';
import { SearchModule } from '@modules/search/search.module';

@Module({
	imports: [
		PrismaModule,
		S3Module,
		EventModule,
		SearchModule,
		BullModule.registerQueue({
			name: 'publishEvent',
		}),
	],
	controllers: [CompanyController],
	providers: [CompanyService, PublishEventProcessor],
})
export class CompanyModule {}
