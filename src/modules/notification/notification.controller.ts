import {
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationFilteringOptionsDto } from './dto/filtering-options.dto';
import { CurrentUser } from '@common/decorators';
import { User } from '@prisma/client';
import { Paginated, PaginationOptionsDto } from '@common/pagination';
import { NotificationEntity } from './entities/notification.entity';
import { IdsQueryDto } from './dto/ids-query.dto';
import {
	ApiNotificationFindAll,
	ApiNotificationFindById,
	ApiNotificationMarkAsRead,
	ApiNotificationMarkAsReadBulk,
	ApiNotificationRemove,
} from './decorators/api-notification.decorator';

@Controller('notifications')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@ApiNotificationFindAll()
	@Get()
	findAll(
		@Query() filteringOptions: NotificationFilteringOptionsDto,
		@Query() paginationOptions: PaginationOptionsDto,
		@CurrentUser() user: User
	): Promise<Paginated<NotificationEntity>> {
		return this.notificationService.findAll(filteringOptions, paginationOptions, user);
	}

	@ApiNotificationFindById()
	@Get(':id')
	findById(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	): Promise<NotificationEntity> {
		return this.notificationService.findById(id, user);
	}

	@ApiNotificationMarkAsRead()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Patch(':id/read')
	markAsRead(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	): Promise<void> {
		return this.notificationService.markAsRead(id, user);
	}

	@ApiNotificationMarkAsReadBulk()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Patch('read')
	markAsReadBulk(
		@Query() { ids }: IdsQueryDto,
		@CurrentUser() user: User
	): Promise<void> {
		return this.notificationService.markAsReadBulk(ids, user);
	}

	@ApiNotificationRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	remove(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() user: User
	): Promise<void> {
		return this.notificationService.remove(id, user);
	}
}
