import {
	Controller,
	Get,
	Post,
	Param,
	Delete,
	ParseIntPipe,
	Query,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUser, Public } from '@common/decorators';
import { Paginated, PaginationOptionsDto } from '@common/pagination';

import { PostService } from './post.service';
import { PostEntity } from './entities/post.entity';
import {
	ApiPostCreateLike,
	ApiPostFindAll,
	ApiPostFindById,
	ApiPostRemoveLike,
} from './decorators/api-post.decorator';

@Controller('posts')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@ApiPostFindById()
	@Public()
	@Get(':id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
		return this.postService.findById(id);
	}

	@ApiPostFindAll()
	@Public()
	@Get()
	findAll(
		@Query() { page, limit }: PaginationOptionsDto
	): Promise<Paginated<PostEntity>> {
		return this.postService.findAll(page, limit);
	}

	@ApiPostCreateLike()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Post(':id/like')
	like(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
		return this.postService.createLike(id, user);
	}

	@ApiPostRemoveLike()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/like')
	unlike(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
		return this.postService.removeLike(id, user);
	}
}
