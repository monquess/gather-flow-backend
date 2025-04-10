import { ApiPaginatedResponse } from '@common/pagination/api-paginated-response';
import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
} from '@nestjs/swagger';
import { EventEntity } from '../entities/event.entity';
import { Format, Theme, VisitorsVisibility } from '@prisma/client';
import { ApiAuth } from '@common/decorators/swagger/api-auth.decorator';
import { CreateEventTicketResponseDto } from '../dto/create-event-ticket-response.dto';

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
		ApiParam({
			name: 'id',
			description: 'event id',
		}),
		ApiOkResponse({
			type: EventEntity,
		}),
		ApiNotFoundResponse({
			description: 'Record not found',
		})
	);

export const ApiEventCreateTicket = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Create event ticket' }),
		ApiParam({
			name: 'id',
			description: 'event id',
		}),
		ApiCreatedResponse({ type: CreateEventTicketResponseDto }),
		ApiBadRequestResponse({
			description: 'Only 5 tickets remaining',
		}),
		ApiNotFoundResponse({
			description: 'Event not found',
		})
	);
