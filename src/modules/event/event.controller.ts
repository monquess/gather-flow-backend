import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseInterceptors,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Paginated, PaginationOptionsDto } from '@common/pagination';
import { Environment } from '@common/decorators/environment.decorator';
import { NodeEnv } from '@common/enum/node-env.enum';
import { CacheInterceptor } from '@common/interceptors/cache.interceptor';
import { CommentEntity } from '@modules/comment/entities/comment.entity';
import { CreateCommentDto } from '@modules/comment/dto';
import {
	ApiEventCreatePromocode,
	ApiEventCreateTicket,
	ApiEventCreateComment,
	ApiEventFindAll,
	ApiEventFindById,
	ApiEventFindPromocodes,
	ApiEventUpdatePromocode,
	ApiEventFindComments,
	ApiEventFindSimilar,
	ApiReminderCreate,
	ApiReminderRemove,
} from './decorators/api-event.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateEventTicketResponseDto } from './dto/create-event-ticket-response.dto';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { PromocodeEntity } from './entities/promocode.entity';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import {
	EventFilteringOptionsDto,
	EventSortingOptionsDto,
	SimilarEventsQueryDto,
} from './dto';
import { EventEntity } from './entities/event.entity';
import { EventService } from './event.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderEntity } from './entities/reminder.entity';

@UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@Environment(NodeEnv.DEV)
	@Public()
	@Post('index')
	index(): Promise<void> {
		return this.eventService.index();
	}

	@ApiEventFindPromocodes()
	@Get(':id/promocodes')
	findEventPromocodes(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	): Promise<PromocodeEntity[]> {
		return this.eventService.findEventPromocodes(id, user);
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

	@ApiEventCreatePromocode()
	@Post(':id/promocodes')
	createEventPromocode(
		@Param('id', ParseIntPipe) id: number,
		@Body() createPromocodeDto: CreatePromocodeDto,
		@CurrentUser() user: User
	): Promise<PromocodeEntity> {
		return this.eventService.createEventPromocode(id, createPromocodeDto, user);
	}

	@ApiEventUpdatePromocode()
	@Patch(':eventId/promocodes/:promocodeId')
	updateEventPromocode(
		@Param('eventId', ParseIntPipe) eventId: number,
		@Param('promocodeId', ParseIntPipe) promocodeId: number,
		@Body() updatePromocodeDto: UpdatePromocodeDto,
		@CurrentUser() user: User
	): Promise<PromocodeEntity> {
		return this.eventService.updateEventPromocode(
			eventId,
			promocodeId,
			updatePromocodeDto,
			user
		);
	}

	@ApiEventFindAll()
	@Public()
	@Get()
	findAll(
		@Query() filteringOptions: EventFilteringOptionsDto,
		@Query() sortingOptions: EventSortingOptionsDto,
		@Query() paginationOptions: PaginationOptionsDto
	): Promise<Paginated<EventEntity>> {
		return this.eventService.findAll(filteringOptions, sortingOptions, paginationOptions);
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

	@ApiEventFindComments()
	@Public()
	@Get(':id/comments')
	findComment(
		@Param('id', ParseIntPipe) id: number,
		@Query() paginationOptions: PaginationOptionsDto
	): Promise<Paginated<CommentEntity>> {
		return this.eventService.findComments(id, paginationOptions);
	}

	@ApiEventCreateComment()
	@Post(':id/comments')
	createComment(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: CreateCommentDto,
		@CurrentUser() user: User
	): Promise<CommentEntity> {
		return this.eventService.createComment(id, dto, user);
	}

	@ApiReminderCreate()
	@Post(':id/reminders')
	createReminder(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: CreateReminderDto,
		@CurrentUser() user: User
	): Promise<ReminderEntity> {
		return this.eventService.createReminder(id, dto, user);
	}

	@ApiReminderRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':eventId/reminder/:reminderId')
	removeReminder(
		@Param('eventId', ParseIntPipe) eventId: number,
		@Param('reminderId', ParseIntPipe) reminderId: number,
		@CurrentUser() user: User
	): Promise<void> {
		return this.eventService.removeReminder(eventId, reminderId, user);
	}
}
