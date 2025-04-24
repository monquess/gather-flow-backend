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
} from '@nestjs/swagger';

import { ApiAuth, ApiPaginatedResponse } from '@common/decorators';
import {} from '@common/decorators/swagger/api-paginated-response';
import { EventEntity } from '@modules/event/entities/event.entity';
import { CompanyEntity } from '../entities/company.entity';
import { CompanyMemberEntity } from '../entities/company-member.entity';
import { PostEntity } from '@modules/post/entities/post.entity';

export const ApiCompanyFindAll = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get paginated companies' }),
		ApiPaginatedResponse<CompanyEntity>(CompanyEntity)
	);

export const ApiCompanyFindEvents = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get paginated company events' }),
		ApiParam({
			name: 'id',
			description: 'Company id',
		}),
		ApiPaginatedResponse<EventEntity>(EventEntity)
	);

export const ApiCompanyFindById = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get company by id' }),
		ApiParam({
			name: 'id',
			description: 'Company id',
		}),
		ApiOkResponse({
			type: CompanyEntity,
		}),
		ApiNotFoundResponse({
			description: 'Company not found',
		})
	);

export const ApiCompanyCreate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Create company' }),
		ApiCreatedResponse({
			type: CompanyEntity,
		})
	);

export const ApiCompanyMemberCreate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Create company member' }),
		ApiParam({
			name: 'companyId',
			description: 'Company id',
		}),
		ApiParam({
			name: 'userId',
			description: 'User id',
		}),
		ApiCreatedResponse({
			type: CompanyMemberEntity,
		}),
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
			name: 'id',
			description: 'Company id',
		}),
		ApiCreatedResponse({
			type: EventEntity,
		}),
		ApiNotFoundResponse({
			description: 'Company not found',
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
			description: 'Company id',
		}),
		ApiOkResponse({
			type: CompanyEntity,
		}),
		ApiNotFoundResponse({
			description: 'Company not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		}),
		ApiConflictResponse({
			description: 'Company already exists',
		})
	);

export const ApiCompanyMemberUpdateRole = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Update company member role' }),
		ApiParam({
			name: 'companyId',
			description: 'Company id',
		}),
		ApiParam({
			name: 'userId',
			description: 'User id',
		}),
		ApiOkResponse({
			type: CompanyMemberEntity,
		}),
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
			description: 'Company id',
		}),
		ApiParam({
			name: 'eventId',
			description: 'Event id',
		}),
		ApiOkResponse({
			type: EventEntity,
		}),
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
			description: 'Company id',
		}),
		ApiNoContentResponse(),
		ApiNotFoundResponse({
			description: 'Company not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);

export const ApiCompanyMemberRemove = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Delete company member' }),
		ApiParam({
			name: 'companyId',
			description: 'Company id',
		}),
		ApiParam({
			name: 'userId',
			description: 'User id',
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
			description: 'Company id',
		}),
		ApiParam({
			name: 'eventId',
			description: 'Event id',
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

export const ApiCompanyFindPosts = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get paginated company posts' }),
		ApiParam({
			name: 'id',
			description: 'Company id',
		}),
		ApiPaginatedResponse<PostEntity>(PostEntity)
	);

export const ApiCompanyPostCreate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Create post' }),
		ApiParam({
			name: 'id',
			description: 'Company id',
		}),
		ApiCreatedResponse({
			type: PostEntity,
		}),
		ApiNotFoundResponse({
			description: 'Company not found',
		}),
		ApiNotFoundResponse({
			description: 'Post not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);

export const ApiCompanyPostUpdate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Update post' }),
		ApiParam({
			name: 'companyId',
			description: 'Company id',
		}),
		ApiParam({
			name: 'postId',
			description: 'Post id',
		}),
		ApiOkResponse({
			type: PostEntity,
		}),
		ApiNotFoundResponse({
			description: 'Company not found',
		}),
		ApiNotFoundResponse({
			description: 'Post not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);

export const ApiCompanyPostRemove = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Delete event' }),
		ApiParam({
			name: 'companyId',
			description: 'Company id',
		}),
		ApiParam({
			name: 'postId',
			description: 'Post id',
		}),
		ApiNoContentResponse(),
		ApiNotFoundResponse({
			description: 'Company not found',
		}),
		ApiNotFoundResponse({
			description: 'Post not found',
		}),
		ApiForbiddenResponse({
			description: 'Access denied',
		})
	);
