import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { TicketEntity } from '../entities/ticket.entity';
import { ApiPaginatedResponse } from '@common/decorators';

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
