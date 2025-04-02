import { applyDecorators } from '@nestjs/common';
import {
	ApiOperation,
	ApiCreatedResponse,
	ApiConflictResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiBadRequestResponse,
	ApiHeader,
} from '@nestjs/swagger';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { ApiAuth } from '@common/decorators/swagger/api-auth.decorator';

export const ApiAuthRegister = () =>
	applyDecorators(
		ApiOperation({ summary: 'Register a new user' }),
		ApiHeader({
			name: 'X-Recaptcha-Token',
			description: 'Google reCAPTCHA token',
			required: true,
		}),
		ApiCreatedResponse({
			description: 'User has been successfully registered',
		}),
		ApiConflictResponse({ description: 'User already exists' })
	);

export const ApiAuthLogin = () =>
	applyDecorators(
		ApiOperation({ summary: 'Login user' }),
		ApiHeader({
			name: 'X-Recaptcha-Token',
			description: 'Google reCAPTCHA token',
			required: true,
		}),
		ApiOkResponse({ type: AuthResponseDto }),
		ApiUnauthorizedResponse({ description: 'Invalid email or password' })
	);

export const ApiAuthLogout = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Logout user' }),
		ApiNoContentResponse({
			description: 'User has been successfully logged out',
		})
	);

export const ApiAuthRefresh = () =>
	applyDecorators(
		ApiAuth(),
		ApiOperation({ summary: 'Refresh JWT tokens' }),
		ApiOkResponse({ type: AuthResponseDto }),
		ApiUnauthorizedResponse({ description: 'Invalid refresh token' }),
		ApiNotFoundResponse({ description: "User doesn't exist" })
	);

export const ApiAuthSendVerification = () =>
	applyDecorators(
		ApiOperation({ summary: 'Send email with verification code' }),
		ApiNoContentResponse({
			description: 'Email has been successfully sent',
		}),
		ApiNotFoundResponse({ description: 'User not found' })
	);

export const ApiAuthVerifyEmail = () =>
	applyDecorators(
		ApiOperation({ summary: 'Verify user email' }),
		ApiNoContentResponse({
			description: 'User email has been successfully verified',
		}),
		ApiBadRequestResponse({ description: 'Invalid email or token' })
	);

export const ApiAuthForgotPassword = () =>
	applyDecorators(
		ApiOperation({ summary: 'Send email with password reset code' }),
		ApiNoContentResponse({
			description: 'Email has been successfully sent',
		}),
		ApiNotFoundResponse({ description: 'User not found' })
	);

export const ApiAuthResetPassword = () =>
	applyDecorators(
		ApiOperation({ summary: 'Reset user password' }),
		ApiNoContentResponse({
			description: 'Password has been successfully reset',
		}),
		ApiBadRequestResponse({ description: 'Invalid email or token' })
	);
