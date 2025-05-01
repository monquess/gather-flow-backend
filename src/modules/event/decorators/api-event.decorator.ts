import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiBody,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiNoContentResponse,
} from '@nestjs/swagger';

import { ApiPaginatedResponse } from '@common/pagination';
import { CommentEntity } from '@modules/comment/entities/comment.entity';
import { CreateCommentDto } from '@modules/comment/dto';
import { EventEntity } from '../entities/event.entity';
import { ApiAuth } from '@common/decorators/swagger/api-auth.decorator';
import { CreateEventTicketResponseDto } from '../dto/create-event-ticket-response.dto';
import { PromocodeEntity } from '../entities/promocode.entity';
import { ReminderEntity } from '../entities/reminder.entity';
import { UserEntity } from '@modules/user/entities/user.entity';

export const ApiEventFindAll = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get paginated events' }),
		ApiPaginatedResponse<EventEntity>(EventEntity)
	);

export const ApiEventFindById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get event by id' }),
		ApiParam({
			name: 'id',
			description: 'event id',
		}),
		ApiOkResponse({
			type: EventEntity,
		}),
		ApiNotFoundResponse({
			description: 'Event not found',
		})
	);

export const ApiEventAttendeeFindAll = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get event attendees' }),
		ApiParam({
			name: 'id',
			description: 'event id',
		}),
		ApiPaginatedResponse<UserEntity>(UserEntity),
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
			description: 'Event not found',
		})
	);

export const ApiEventFindSimilar = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get similar events by event id' }),
		ApiOkResponse({
			type: [EventEntity],
		}),
		ApiNotFoundResponse({
			description: 'Event not found',
		})
	);

export const ApiEventFindPromocodes = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Get event promocodes' }),
		ApiParam({
			name: 'id',
			description: 'Event id',
		}),
		ApiOkResponse({
			type: [PromocodeEntity],
		}),
		ApiNotFoundResponse({
			description: 'Event not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);

export const ApiEventCreateTicket = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Create event ticket' }),
		ApiParam({
			name: 'id',
			description: 'Event id',
		}),
		ApiCreatedResponse({ type: CreateEventTicketResponseDto }),
		ApiBadRequestResponse({
			description: 'Only 5 tickets remaining',
		}),
		ApiNotFoundResponse({
			description: 'Event not found',
		})
	);

export const ApiEventCreatePromocode = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Create event promocode' }),
		ApiParam({
			name: 'id',
			description: 'Event id',
		}),
		ApiCreatedResponse({ type: PromocodeEntity }),
		ApiNotFoundResponse({
			description: 'Event not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);

export const ApiReminderCreate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Create reminder for event' }),
		ApiParam({
			name: 'id',
			description: 'event id',
		}),
		ApiOkResponse({ type: ReminderEntity }),
		ApiNotFoundResponse({
			description: 'Event not found',
		})
	);

export const ApiEventUpdatePromocode = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Update event promocode' }),
		ApiParam({
			name: 'eventId',
			description: 'Event id',
		}),
		ApiParam({
			name: 'promocodeId',
			description: 'Promocode id',
		}),
		ApiOkResponse({ type: PromocodeEntity }),
		ApiNotFoundResponse({
			description: 'Promocode not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);

export const ApiReminderRemove = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Remove reminder for event' }),
		ApiParam({
			name: 'eventId',
			description: 'event id',
		}),
		ApiParam({
			name: 'reminderId',
			description: 'reminder id',
		}),
		ApiNoContentResponse(),
		ApiNotFoundResponse({
			description: 'Event not found',
		})
	);

export const ApiEventFindPromocode = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Get event promocode' }),
		ApiParam({
			name: 'eventId',
			description: 'Event id',
		}),
		ApiParam({
			name: 'code',
		}),
		ApiOkResponse({ type: PromocodeEntity }),
		ApiNotFoundResponse({
			description: 'Event not found',
		}),
		ApiNotFoundResponse({
			description: 'Promocode not found',
		})
	);
