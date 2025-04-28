import { applyDecorators } from '@nestjs/common';
import {
	ApiConflictResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
} from '@nestjs/swagger';

import { ApiAuth, ApiPaginatedResponse } from '@common/decorators';
import { PostEntity } from '../entities/post.entity';

export const ApiPostFindById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get post by id' }),
		ApiParam({
			name: 'id',
			description: 'Post id',
		}),
		ApiOkResponse({
			type: PostEntity,
		}),
		ApiNotFoundResponse({
			description: 'Post not found',
		})
	);

export const ApiPostFindAll = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get paginated posts' }),
		ApiPaginatedResponse<PostEntity>(PostEntity)
	);

export const ApiPostCreateLike = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Like post by id' }),
		ApiParam({
			name: 'id',
			description: 'Post id',
		}),
		ApiNoContentResponse(),
		ApiNotFoundResponse({
			description: 'Post not found',
		}),
		ApiConflictResponse({
			description: 'Like already exists',
		})
	);

export const ApiPostRemoveLike = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Remove like under the post by id' }),
		ApiParam({
			name: 'id',
			description: 'Post id',
		}),
		ApiNoContentResponse(),
		ApiNotFoundResponse({
			description: 'Post not found',
		}),
		ApiNotFoundResponse({
			description: 'Like not found',
		})
	);
