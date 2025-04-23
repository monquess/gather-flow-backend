import { Module } from '@nestjs/common';

import { PrismaModule } from '@modules/prisma/prisma.module';
import { SearchModule } from '@modules/search/search.module';

import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
	imports: [PrismaModule, SearchModule],
	controllers: [EventController],
	providers: [EventService],
	exports: [EventService],
})
export class EventModule {}
