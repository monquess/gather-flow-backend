import { forwardRef, Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { CompanyModule } from '@modules/company/company.module';

@Module({
	imports: [PrismaModule, forwardRef(() => CompanyModule)],
	controllers: [SubscriptionController],
	providers: [SubscriptionService],
	exports: [SubscriptionService],
})
export class SubscriptionModule {}
