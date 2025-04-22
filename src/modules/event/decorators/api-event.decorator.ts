import { applyDecorators } from '@nestjs/common';
import {
	ApiBody,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
} from '@nestjs/swagger';
import { Format, Theme, VisitorsVisibility } from '@prisma/client';

import { ApiPaginatedResponse } from '@common/pagination/api-paginated-response';
import { ApiAuth } from '@common/decorators/swagger/api-auth.decorator';
import { EventEntity } from '../entities/event.entity';
import { CommentEntity } from '@modules/comment/entities/comment.entity';
import { CreateCommentDto } from '@modules/comment/dto';

export const ApiEventFindAll = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get paginated events' }),
		ApiQuery({
			name: 'title',
			required: false,
			type: String,
		}),
		ApiQuery({
			name: 'format',
			required: false,
			enum: Format,
		}),
		ApiQuery({
			name: 'theme',
			required: false,
			enum: Theme,
		}),
		ApiQuery({
			name: 'visitorsVisibility',
			required: false,
			enum: VisitorsVisibility,
		}),
		ApiQuery({
			name: 'companyId',
			required: false,
			type: Number,
		}),
		ApiQuery({
			name: 'startDate',
			required: false,
			type: Date,
		}),
		ApiQuery({
			name: 'endDate',
			required: false,
			type: Date,
		}),
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
