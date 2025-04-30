import { applyDecorators } from '@nestjs/common';
import {
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
} from '@nestjs/swagger';
import { CompanySubscriptionEntity } from '../entities/company-subscription.entity';
import { ApiAuth } from '@common/decorators';

export const ApiCompanySubscriptionFindAll = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get company subscriptions' }),
		ApiOkResponse({
			type: [CompanySubscriptionEntity],
		})
	);

export const ApiCompanySubscriptionCreate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Create company subscription' }),
		ApiOkResponse({
			type: CompanySubscriptionEntity,
		}),
		ApiNotFoundResponse({
			description: 'Company not found',
		})
	);

export const ApiCompanySubscriptionRemove = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Remove company subscription' }),
		ApiParam({
			name: 'companyId',
			description: 'company id',
		}),
		ApiNoContentResponse({
			description: 'Company subscription removed',
		}),
		ApiNotFoundResponse({
			description: 'Company not found',
		})
	);
