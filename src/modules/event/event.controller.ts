import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Param,
	ParseIntPipe,
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
	ApiEventCreateComment,
	ApiEventFindAll,
	ApiEventFindById,
	ApiEventFindComments,
	ApiEventFindSimilar,
} from './decorators/api-event.decorator';
import {
	EventFilteringOptionsDto,
	EventSortingOptionsDto,
	SimilarEventsQueryDto,
} from './dto';
import { EventEntity } from './entities/event.entity';
import { EventService } from './event.service';

@UseInterceptors(CacheInterceptor, ClassSerializerInterceptor)
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
}
