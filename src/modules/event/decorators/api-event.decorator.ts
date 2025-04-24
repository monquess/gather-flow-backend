import { applyDecorators } from '@nestjs/common';
import {
	ApiBody,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
} from '@nestjs/swagger';

import { ApiPaginatedResponse } from '@common/pagination';
import { ApiAuth } from '@common/decorators/swagger/api-auth.decorator';
import { CommentEntity } from '@modules/comment/entities/comment.entity';
import { CreateCommentDto } from '@modules/comment/dto';

import { EventEntity } from '../entities/event.entity';

export const ApiEventFindAll = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get paginated events' }),
		ApiPaginatedResponse<EventEntity>(EventEntity)
	);

export const ApiEventFindById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get event by id' }),
		ApiOkResponse({
			type: EventEntity,
		}),
		ApiNotFoundResponse({
			description: 'Event not found',
		})
	);

export const ApiEventFindComments = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get comments of event' }),
		ApiParam({
			type: Number,
			name: 'id',
			description: 'Event id',
		}),
		ApiPaginatedResponse<CommentEntity>(CommentEntity)
	);

export const ApiEventCreateComment = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Add comment to event' }),
		ApiParam({
			type: Number,
			name: 'id',
			description: 'Event id',
		}),
		ApiBody({ type: CreateCommentDto }),
		ApiOkResponse({
			type: CommentEntity,
		}),
		ApiNotFoundResponse({
			description: 'Comment not found',
		})
	);

export const ApiEventFindSimilar = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get similar events by event id' }),
		ApiOkResponse({
			type: [EventEntity],
		}),
		ApiNotFoundResponse({
			description: 'Record not found',
		})
	);

export const ApiEventFindSimilar = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get similar events by event id' }),
		ApiOkResponse({
			type: [EventEntity],
		}),
		ApiNotFoundResponse({
			description: 'Record not found',
		})
	);
