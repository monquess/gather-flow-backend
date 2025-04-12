import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { Public } from '@common/decorators/public.decorator';
import { Paginated, PaginationOptionsDto } from '@common/pagination';

import { ApiEventFindAll, ApiEventFindById } from './decorators/api-event.decorator';
import { EventFilteringOptionsDto } from './dto/filtering-options.dto';
import { EventEntity } from './entities/event.entity';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@ApiEventFindAll()
	@Public()
	@Get()
	findAll(
		@Query() filteringOptions: EventFilteringOptionsDto,
		@Query() paginationOptions: PaginationOptionsDto
	): Promise<Paginated<EventEntity>> {
		return this.eventService.findAll(filteringOptions, paginationOptions);
	}

	@ApiEventFindById()
	@Public()
	@Get(':id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<EventEntity> {
		return this.eventService.findById(id);
	}
}
