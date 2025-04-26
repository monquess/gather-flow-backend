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
	ClassSerializerInterceptor,
	SerializeOptions,
	UseInterceptors,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUser, Public } from '@common/decorators';
import { Paginated, PaginationOptionsDto } from '@common/pagination';
import { CacheInterceptor } from '@common/interceptors/cache.interceptor';

import { PostService } from './post.service';
import { PostEntity } from './entities/post.entity';
import {
	ApiPostCreateLike,
	ApiPostFindAll,
	ApiPostFindById,
	ApiPostRemoveLike,
} from './decorators/api-post.decorator';
import { PostSortingOptionsDto } from './dto';

@UseInterceptors(CacheInterceptor, ClassSerializerInterceptor)
@SerializeOptions({ type: PostEntity })
@Controller('posts')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@ApiPostFindById()
	@Public()
	@Get(':id')
	findById(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	): Promise<PostEntity> {
		return this.postService.findById(id, user);
	}

	@ApiPostFindAll()
	@Public()
	@Get()
	findAll(
		@Query() sortingOptions: PostSortingOptionsDto,
		@Query() { page, limit }: PaginationOptionsDto,
		@CurrentUser() user: User
	): Promise<Paginated<PostEntity>> {
		return this.postService.findAll(sortingOptions, page, limit, user);
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
