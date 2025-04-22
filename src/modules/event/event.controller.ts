import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

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

@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

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
