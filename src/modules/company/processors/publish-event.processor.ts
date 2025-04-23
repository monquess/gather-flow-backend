import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventStatus } from '@prisma/client';

import { PrismaService } from '@modules/prisma/prisma.service';
import { PublishEventJobData } from '../interfaces/publish-event-job-data.interface';

@Processor('publishEvent')
export class PublishEventProcessor extends WorkerHost {
	constructor(private prisma: PrismaService) {
		super();
	}

	async process(job: Job<PublishEventJobData>): Promise<void> {
		const { eventId } = job.data;

		await this.prisma.event.update({
			where: { id: eventId },
			data: {
				status: EventStatus.PUBLISHED,
			},
		});
	}
}
