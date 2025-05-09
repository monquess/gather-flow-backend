import {
	Controller,
	Get,
	Body,
	Patch,
	Param,
	Delete,
	HttpCode,
	HttpStatus,
	ParseIntPipe,
	UseInterceptors,
	ClassSerializerInterceptor,
	Query,
	Post,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import { CacheInterceptor } from '@common/interceptors/cache.interceptor';

import { CreateCommentDto, UpdateCommentDto } from './dto';
import { CommentEntity } from './entities/comment.entity';
import { CommentService } from './comment.service';
import {
	ApiCommentUpdate,
	ApiCommentRemove,
	ApiCommentFindById,
	ApiCommentFindReplies,
	ApiCommentReply,
} from './decorators/api-comment.decorator';
import { Paginated } from '@common/pagination/paginated';
import { PaginationOptionsDto } from '@common/pagination/pagination-options.dto';
import { Public } from '@common/decorators/public.decorator';

@UseInterceptors(CacheInterceptor, ClassSerializerInterceptor)
@Controller('comments')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}

	@ApiCommentFindById()
	@Public()
	@Get(':id')
	findById(@Param('id') id: number): Promise<CommentEntity> {
		return this.commentService.findById(id);
	}

	@ApiCommentFindReplies()
	@Public()
	@Get(':id/replies')
	findReplies(
		@Param('id') id: number,
		@Query() paginationOptions: PaginationOptionsDto
	): Promise<Paginated<CommentEntity>> {
		return this.commentService.findReplies(id, paginationOptions);
	}

	@ApiCommentReply()
	@Post(':id/replies')
	reply(
		@Param('id') id: number,
		@Body() dto: CreateCommentDto,
		@CurrentUser() user: User
	): Promise<CommentEntity> {
		return this.commentService.reply(id, dto, user);
	}

	@ApiCommentUpdate()
	@Patch(':id')
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateCommentDto,
		@CurrentUser() user: User
	): Promise<CommentEntity> {
		return this.commentService.update(id, dto, user);
	}

	@ApiCommentRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	remove(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	): Promise<void> {
		return this.commentService.remove(id, user);
	}
}
