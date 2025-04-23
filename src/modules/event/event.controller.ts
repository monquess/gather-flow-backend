import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';

import { Public } from '@common/decorators/public.decorator';
import { Paginated, PaginationOptionsDto } from '@common/pagination';

import {
	ApiEventFindAll,
	ApiEventFindById,
	ApiEventFindSimilar,
} from './decorators/api-event.decorator';
import { EventFilteringOptionsDto } from './dto/filtering-options.dto';
import { EventEntity } from './entities/event.entity';
import { EventService } from './event.service';
import { SimilarEventsQueryDto } from './dto/similar-events-query.dto';
import { Environment } from '@common/decorators/environment.decorator';
import { NodeEnv } from '@common/enum/node-env.enum';

@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@Environment(NodeEnv.DEV)
	@Public()
	@Post('index')
	index(): Promise<void> {
		return this.eventService.index();
	}

	@ApiEventFindById()
	@Public()
	@Get(':id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<EventEntity> {
		return this.eventService.findById(id);
	}

	@ApiEventFindAll()
	@Public()
	@Get()
	findAll(
		@Query() filteringOptions: EventFilteringOptionsDto,
		@Query() paginationOptions: PaginationOptionsDto
	): Promise<Paginated<EventEntity>> {
		return this.eventService.findAll(filteringOptions, paginationOptions);
	}

	@ApiEventFindSimilar()
	@Public()
	@Get(':id/similar')
	findSimilar(
		@Param('id', ParseIntPipe) id: number,
		@Query() { limit }: SimilarEventsQueryDto
	): Promise<EventEntity[]> {
		return this.eventService.findSimilar(id, limit);
	}
}
