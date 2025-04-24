import { forwardRef, Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { TicketModule } from '@modules/ticket/ticket.module';
import { CompanyModule } from '@modules/company/company.module';

@Module({
	imports: [
		PrismaModule,
		PaymentModule,
		TicketModule,
		forwardRef(() => CompanyModule),
	],
	controllers: [EventController],
	providers: [EventService],
	exports: [EventService],
})
export class EventModule {}
