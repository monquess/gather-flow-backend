import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import { Public } from '@common/decorators/public.decorator';
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { FilteringOptionsDto } from './dto/filtering-options.dto';
import { EventEntity } from './entities/event.entity';
import { Paginated } from '@common/pagination/paginated';
import {
	ApiEventCreateTicket,
	ApiEventFindAll,
	ApiEventFindById,
} from './decorators/api-event.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateEventTicketResponseDto } from './dto/create-event-ticket-response.dto';

@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@ApiEventFindAll()
	@Public()
	@Get()
	findAll(
		@Query() filteringOptions: FilteringOptionsDto,
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

	@ApiEventCreateTicket()
	@Post(':id/tickets')
	createEventTicket(
		@Param('id', ParseIntPipe) id: number,
		@Body() createTicketDto: CreateTicketDto,
		@CurrentUser() user: User
	): Promise<CreateEventTicketResponseDto> {
		return this.eventService.createEventTicket(id, createTicketDto, user);
	}
}
