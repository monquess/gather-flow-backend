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
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { Paginated } from '@common/pagination/paginated';
import { CacheInterceptor } from '@common/interceptors/cache.interceptor.ts.interceptor';
import { CommentEntity } from '@modules/comment/entities/comment.entity';
import { CreateCommentDto } from '@modules/comment/dto';

import {
	ApiEventCreateComment,
	ApiEventFindAll,
	ApiEventFindById,
	ApiEventFindComments,
} from './decorators/api-event.decorator';
import { FilteringOptionsDto } from './dto';
import { EventEntity } from './entities/event.entity';
import { EventService } from './event.service';

@UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
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
