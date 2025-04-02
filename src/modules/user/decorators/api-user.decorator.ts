import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiConsumes,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
} from '@nestjs/swagger';

import { FileUploadDto } from '@modules/user/dto/file-upload.dto';
import { UpdatePasswordDto } from '@modules/user/dto/update-password.dto';
import { UpdateUserDto } from '@modules/user/dto/update-user.dto';
import { UserEntity } from '@modules/user/entities/user.entity';
import { ApiAuth } from '@common/decorators/swagger/api-auth.decorator';

export const ApiUserSelf = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Get information about current user' }),
		ApiOkResponse({
			type: UserEntity,
		})
	);

export const ApiUserFindAll = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Get all users' }),
		ApiQuery({
			name: 'username',
			required: false,
			type: String,
		}),
		ApiQuery({
			name: 'email',
			required: false,
			type: String,
		}),
		ApiOkResponse({
			type: [UserEntity],
		})
	);

export const ApiUserFindById = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Get user by id' }),
		ApiOkResponse({
			type: UserEntity,
		}),
		ApiNotFoundResponse({
			description: 'Record not found',
		})
	);

export const ApiUserUpdate = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Update user' }),
		ApiParam({
			name: 'id',
			description: 'user id',
		}),
		ApiBody({
			type: UpdateUserDto,
		}),
		ApiOkResponse({ type: UserEntity }),
		ApiNotFoundResponse({ description: 'User not found' }),
		ApiConflictResponse({ description: 'User already exists' })
	);

export const ApiUserUpdatePassword = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Update password' }),
		ApiParam({
			name: 'id',
			description: 'user id',
		}),
		ApiBody({
			type: UpdatePasswordDto,
		}),
		ApiOkResponse({ type: UserEntity }),
		ApiNotFoundResponse({ description: 'User not found' }),
		ApiBadRequestResponse({ description: 'Current password is incorrect' })
	);

export const ApiUserUpdateAvatar = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Update avatar' }),
		ApiParam({
			name: 'id',
			description: 'user id',
		}),
		ApiConsumes('multipart/form-data'),
		ApiBody({
			type: FileUploadDto,
		}),
		ApiOkResponse({ type: UserEntity }),
		ApiNotFoundResponse({ description: 'User not found' })
	);

export const ApiUserRemove = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Delete user' }),
		ApiParam({
			name: 'id',
			description: 'user id',
		}),
		ApiNotFoundResponse({ description: 'User not found' })
	);
