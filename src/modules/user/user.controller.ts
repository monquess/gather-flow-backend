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

import { CurrentUser, UploadedImage } from '@common/decorators';
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

	@ApiUserFindAll()
	@Get()
	findAll(@Query() filteringOptions: FilteringOptionsDto): Promise<UserEntity[]> {
		return this.userService.findAll(filteringOptions);
	}

	@ApiUserFindById()
	@Get(':id')
	findById(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
		return this.userService.findById(id);
	}

	@ApiUserUpdate()
	@Patch(':id')
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto
	): Promise<UserEntity> {
		return this.userService.update(id, updateUserDto);
	}

	@ApiUserUpdatePassword()
	@Patch(':id/updatePassword')
	updatePassword(
		@Param('id', ParseIntPipe) id: number,
		@Body() updatePasswordDto: UpdatePasswordDto
	): Promise<UserEntity> {
		return this.userService.updatePassword(id, updatePasswordDto);
	}

	@ApiUserUpdateAvatar()
	@Patch(':id/avatar')
	@UseInterceptors(FileInterceptor('avatar'))
	updateAvatar(
		@Param('id', ParseIntPipe) id: number,
		@UploadedImage({ width: 400, height: 400 }) avatar: Express.Multer.File
	): Promise<UserEntity> {
		return this.userService.updateAvatar(id, avatar);
	}

	@ApiUserRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.userService.remove(id);
	}
}
