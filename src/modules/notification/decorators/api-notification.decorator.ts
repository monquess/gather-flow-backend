import { ApiAuth, ApiPaginatedResponse } from '@common/decorators';
import { applyDecorators } from '@nestjs/common';
import {
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
} from '@nestjs/swagger';
import { NotificationEntity } from '../entities/notification.entity';

export const ApiNotificationFindAll = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Get paginated notifications' }),
		ApiPaginatedResponse<NotificationEntity>(NotificationEntity)
	);

export const ApiNotificationFindById = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Get notification by id' }),
		ApiParam({
			name: 'id',
			description: 'notification id',
		}),
		ApiOkResponse({
			type: NotificationEntity,
		}),
		ApiNotFoundResponse({
			description: 'Notification not found',
		})
	);

export const ApiNotificationMarkAsRead = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Mark notification as read' }),
		ApiParam({
			name: 'id',
			description: 'notification id',
		}),
		ApiNoContentResponse({
			description: 'Notification marked as read',
		}),
		ApiNotFoundResponse({
			description: 'Notification not found',
		})
	);

export const ApiNotificationMarkAsReadBulk = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Mark notifications as read' }),
		ApiNoContentResponse({
			description: 'Notifications marked as read',
		})
	);

export const ApiNotificationRemove = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Remove notification' }),
		ApiParam({
			name: 'id',
			description: 'notification id',
		}),
		ApiNoContentResponse({
			description: 'Notification removed',
		}),
		ApiNotFoundResponse({
			description: 'Notification not found',
		})
	);
