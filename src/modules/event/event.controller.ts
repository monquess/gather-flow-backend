import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { Public } from '@common/decorators/public.decorator';
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { Paginated } from '@common/pagination/paginated';

import {
	ApiEventFindAll,
	ApiEventFindById,
} from './decorators/api-event.decorator';
import { FilteringOptionsDto } from './dto/filtering-options.dto';
import { EventEntity } from './entities/event.entity';
import { EventService } from './event.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@ApiEventFindAll()
	// @Public()
	@Get()
	findAll(
		@Query() filteringOptions: FilteringOptionsDto,
		@Query() paginationOptions: PaginationOptionsDto,
		@CurrentUser() user: User
	): Promise<Paginated<EventEntity>> {
		return this.eventService.findAll(filteringOptions, paginationOptions, user);
	}

	@ApiEventFindById()
	@Public()
	@Get(':id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<EventEntity> {
		return this.eventService.findById(id);
	}
}
