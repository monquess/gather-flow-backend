import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	HttpCode,
	HttpStatus,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	ParseIntPipe,
	Patch,
	Query,
	SerializeOptions,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

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

import { ImageTransformPipe } from '@modules/s3/pipes/image-transform.pipe';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@UseInterceptors(ClassSerializerInterceptor)
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
	findAll(
		@Query() filteringOptions: FilteringOptionsDto
	): Promise<UserEntity[]> {
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
	@UseInterceptors(FileInterceptor('file'))
	updateAvatar(
		@Param('id', ParseIntPipe) id: number,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|tiff)' }),
					new MaxFileSizeValidator({
						maxSize: 10e6,
						message: 'File is too large. Max file size is 10MB',
					}),
				],
			}),
			new ImageTransformPipe()
		)
		file: Express.Multer.File
	): Promise<UserEntity> {
		return this.userService.updateAvatar(id, file);
	}

	@ApiUserRemove()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.userService.remove(id);
	}
}
