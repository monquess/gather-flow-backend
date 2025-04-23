import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from '@modules/prisma/prisma.module';
import { S3Module } from '@modules/s3/s3.module';
import { EventModule } from '@modules/event/event.module';
import { SearchModule } from '@modules/search/search.module';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { PublishEventProcessor } from './processors/publish-event.processor';

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
