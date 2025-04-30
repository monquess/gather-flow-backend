import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailChannel } from './channels/mail.channel';
import { BullModule } from '@nestjs/bullmq';
import { NotificationProcessor } from './processors/notification.processor';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { DatabaseChannel } from './channels/database.channel';
import { NotificationController } from './notification.controller';

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'notification',
		}),
		PrismaModule,
	],
	providers: [
		NotificationService,
		MailChannel,
		{
			provide: 'MailChannel',
			useExisting: MailChannel,
		},
		DatabaseChannel,
		{
			provide: 'DatabaseChannel',
			useExisting: DatabaseChannel,
		},
		NotificationProcessor,
	],
	exports: [NotificationService],
	controllers: [NotificationController],
})
export class NotificationModule {}
