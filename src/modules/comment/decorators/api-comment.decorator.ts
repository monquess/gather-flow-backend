import { applyDecorators } from '@nestjs/common';
import {
	ApiOperation,
	ApiParam,
	ApiBody,
	ApiOkResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiNoContentResponse,
} from '@nestjs/swagger';
import { ApiAuth } from '@common/decorators/swagger/api-auth.decorator';

import { UpdateCommentDto } from '../dto';
import { CommentEntity } from '../entities/comment.entity';
import { ApiPaginatedResponse } from '@common/pagination/api-paginated-response';

export const ApiCommentFindById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get comment by id' }),
		ApiOkResponse({
			type: CommentEntity,
		}),
		ApiNotFoundResponse({
			description: 'Comment not found',
		})
	);

export const ApiCommentFindReplies = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get comment replies by id' }),
		ApiPaginatedResponse<CommentEntity>(CommentEntity),
		ApiNotFoundResponse({
			description: 'Comment not found',
		})
	);

export const ApiCommentUpdate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Update comment' }),
		ApiParam({
			type: Number,
			name: 'id',
			description: 'Comment id',
		}),
		ApiBody({ type: UpdateCommentDto }),
		ApiOkResponse({
			type: CommentEntity,
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		}),
		ApiNotFoundResponse({
			description: 'Comment not found',
		})
	);

export const ApiCommentRemove = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Delete comment by id' }),
		ApiParam({
			type: Number,
			name: 'id',
			description: 'Comment id',
		}),
		ApiNoContentResponse(),
		ApiForbiddenResponse({
			description: 'Access denied',
		}),
		ApiNotFoundResponse({
			description: 'Comment not found',
		})
	);
