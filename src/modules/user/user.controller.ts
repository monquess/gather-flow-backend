import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Query,
	SerializeOptions,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';

import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import {
	ApiUserFindAll,
	ApiUserFindById,
	ApiUserRemove,
	ApiUserSelf,
	ApiUserUpdate,
	ApiUserUpdateAvatar,
	ApiUserUpdatePassword,
} from './decorators/api-user.decorator';
import { FilteringOptionsDto, UpdateUserDto, UpdatePasswordDto } from './dto';

import { CurrentUser, Public, UploadedImage } from '@common/decorators';
import { CacheInterceptor } from '@common/interceptors/cache.interceptor';

@UseInterceptors(CacheInterceptor, ClassSerializerInterceptor)
@SerializeOptions({ type: UserEntity })
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiUserSelf()
	@Get('self')
	self(@CurrentUser() user: User): UserEntity {
		return user;
	}

	@Public()
	@ApiUserFindAll()
	@Get()
	findAll(@Query() filteringOptions: FilteringOptionsDto): Promise<UserEntity[]> {
		return this.userService.findAll(filteringOptions);
	}

	@Public()
	@ApiUserFindById()
	@Get(':id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
		return this.userService.findById(id);
	}

	@ApiUserUpdate()
	@Patch()
	update(
		@Body() updateUserDto: UpdateUserDto,
		@CurrentUser() user: User
	): Promise<UserEntity> {
		return this.userService.update(user.id, updateUserDto);
	}

	@ApiUserUpdatePassword()
	@Patch('updatePassword')
	updatePassword(
		@Body() updatePasswordDto: UpdatePasswordDto,
		@CurrentUser() user: User
	): Promise<UserEntity> {
		return this.userService.updatePassword(user.id, updatePasswordDto);
	}

	@ApiUserUpdateAvatar()
	@Patch('avatar')
	@UseInterceptors(FileInterceptor('avatar'))
	updateAvatar(
		@UploadedImage({
			width: 400,
			height: 400,
		})
		avatar: Express.Multer.File,
		@CurrentUser() user: User
	): Promise<UserEntity> {
		return this.userService.updateAvatar(user.id, avatar);
	}

	@ApiUserRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete()
	remove(@CurrentUser() user: User): Promise<void> {
		return this.userService.remove(user.id);
	}
}
