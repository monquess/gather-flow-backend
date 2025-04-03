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
