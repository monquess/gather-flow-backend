import { ApiPaginatedResponse } from '@common/pagination/api-paginated-response';
import { applyDecorators } from '@nestjs/common';
import {
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
} from '@nestjs/swagger';
import { TicketEntity } from '../entities/ticket.entity';

export const ApiTicketFindAll = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get paginated tickets' }),
		ApiPaginatedResponse<TicketEntity>(TicketEntity)
	);

export const ApiTicketFindById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get ticket by id' }),
		ApiOkResponse({
			type: TicketEntity,
		}),
		ApiNotFoundResponse({
			description: 'Record not found',
		})
	);
