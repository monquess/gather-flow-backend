import { forwardRef, Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { TicketModule } from '@modules/ticket/ticket.module';
import { CompanyModule } from '@modules/company/company.module';
import { SearchModule } from '@modules/search/search.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { SubscriptionModule } from '@modules/subscription/subscription.module';

@Module({
	imports: [
		PrismaModule,
		SearchModule,
		PaymentModule,
		TicketModule,
		forwardRef(() => CompanyModule),
		NotificationModule,
		SubscriptionModule,
	],
	controllers: [EventController],
	providers: [EventService],
	exports: [EventService],
})
export class EventModule {}
