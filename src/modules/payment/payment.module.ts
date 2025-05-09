import { forwardRef, Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { StripeService } from './stripe.service';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { CompanyModule } from '@modules/company/company.module';
import { TicketModule } from '@modules/ticket/ticket.module';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
	imports: [
		PrismaModule,
		TicketModule,
		forwardRef(() => CompanyModule),
		NotificationModule,
	],
	controllers: [PaymentController],
	providers: [StripeService],
	exports: [StripeService],
})
export class PaymentModule {}
