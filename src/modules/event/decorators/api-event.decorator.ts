import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { ApiPaginatedResponse } from '@common/decorators';
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
