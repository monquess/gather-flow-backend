import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { S3Module } from '@modules/s3/s3.module';
import { EventModule } from '@modules/event/event.module';
import { SearchModule } from '@modules/search/search.module';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { PublishEventProcessor } from './processors/publish-event.processor';
import { PostModule } from '@modules/post/post.module';

@Module({
	imports: [
		PrismaModule,
		S3Module,
		PostModule,
		forwardRef(() => EventModule),
		SearchModule,
		BullModule.registerQueue({
			name: 'publishEvent',
		}),
	],
	controllers: [CompanyController],
	providers: [CompanyService, PublishEventProcessor],
	exports: [CompanyService],
})
export class CompanyModule {}
