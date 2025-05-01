import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { TicketEntity } from '../entities/ticket.entity';
import { ApiAuth, ApiPaginatedResponse } from '@common/decorators';
import { TicketPdfDto } from '../dto/ticket-pdf.dto';

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

export const ApiTicketGetPdf = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Get ticket pdf' }),
		ApiOkResponse({
			type: TicketPdfDto,
		}),
		ApiNotFoundResponse({
			description: 'Record not found',
		})
	);
