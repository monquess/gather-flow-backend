import { ApiAuth } from '@common/decorators/swagger/api-auth.decorator';
import { applyDecorators } from '@nestjs/common';
import {
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
} from '@nestjs/swagger';
import { CompanyEntity } from '../entities/company.entity';
import { ApiPaginatedResponse } from '@common/pagination/api-paginated-response';
import { CompanyMemberEntity } from '../entities/company-member.entity';
import { EventEntity } from '@modules/event/entities/event.entity';

export const ApiCompanyFindAll = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get paginated companies' }),
		ApiQuery({
			name: 'name',
			required: false,
			type: String,
		}),
		ApiPaginatedResponse<CompanyEntity>(CompanyEntity)
	);

export const ApiCompanyFindById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get company by id' }),
		ApiOkResponse({
			type: CompanyEntity,
		}),
		ApiNotFoundResponse({
			description: 'Record not found',
		})
	);

export const ApiCompanyCreate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Create company' }),
		ApiCreatedResponse({ type: CompanyEntity })
	);

export const ApiCompanyMemberCreate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Create company member' }),
		ApiParam({
			name: 'companyId',
			description: 'company id',
		}),
		ApiParam({
			name: 'userId',
			description: 'user id',
		}),
		ApiCreatedResponse({ type: CompanyMemberEntity }),
		ApiNotFoundResponse({
			description: 'Company not found',
		}),
		ApiNotFoundResponse({
			description: 'User not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);

export const ApiEventCreate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Create event' }),
		ApiParam({
			name: 'companyId',
			description: 'company id',
		}),
		ApiParam({
			name: 'eventId',
			description: 'event id',
		}),
		ApiCreatedResponse({ type: EventEntity }),
		ApiNotFoundResponse({
			description: 'Company not found',
		}),
		ApiNotFoundResponse({
			description: 'Event not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);

export const ApiCompanyUpdate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Update company' }),
		ApiParam({
			name: 'id',
			description: 'company id',
		}),
		ApiOkResponse({ type: CompanyEntity }),
		ApiNotFoundResponse({ description: 'Company not found' }),
		ApiForbiddenResponse({ description: 'Access denied' }),
		ApiConflictResponse({ description: 'Company already exists' })
	);

export const ApiCompanyMemberUpdateRole = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Update company member role' }),
		ApiParam({
			name: 'companyId',
			description: 'company id',
		}),
		ApiParam({
			name: 'userId',
			description: 'user id',
		}),
		ApiOkResponse({ type: CompanyMemberEntity }),
		ApiNotFoundResponse({
			description: 'Company not found',
		}),
		ApiNotFoundResponse({
			description: 'User not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);

export const ApiEventUpdate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Update event' }),
		ApiParam({
			name: 'companyId',
			description: 'company id',
		}),
		ApiParam({
			name: 'eventId',
			description: 'event id',
		}),
		ApiOkResponse({ type: EventEntity }),
		ApiNotFoundResponse({
			description: 'Company not found',
		}),
		ApiNotFoundResponse({
			description: 'Event not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);

export const ApiCompanyRemove = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Delete company' }),
		ApiParam({
			name: 'id',
			description: 'company id',
		}),
		ApiNoContentResponse(),
		ApiNotFoundResponse({ description: 'Company not found' }),
		ApiForbiddenResponse({ description: 'Access denied' })
	);

export const ApiCompanyMemberRemove = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Delete company member' }),
		ApiParam({
			name: 'companyId',
			description: 'company id',
		}),
		ApiParam({
			name: 'userId',
			description: 'user id',
		}),
		ApiNoContentResponse(),
		ApiNotFoundResponse({
			description: 'Company not found',
		}),
		ApiNotFoundResponse({
			description: 'User not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);

export const ApiEventRemove = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Delete event' }),
		ApiParam({
			name: 'companyId',
			description: 'company id',
		}),
		ApiParam({
			name: 'eventId',
			description: 'event id',
		}),
		ApiNoContentResponse(),
		ApiNotFoundResponse({
			description: 'Company not found',
		}),
		ApiNotFoundResponse({
			description: 'Event not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);
