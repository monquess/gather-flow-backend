import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailChannel } from './channels/mail.channel';
import { BullModule } from '@nestjs/bullmq';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'notification',
		}),
	],
	providers: [
		NotificationService,
		MailChannel,
		{
			provide: 'MailChannel',
			useExisting: MailChannel,
		},
		NotificationProcessor,
	],
	exports: [NotificationService],
})
export class NotificationModule {}
