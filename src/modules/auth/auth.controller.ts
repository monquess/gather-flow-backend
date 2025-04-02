import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Res,
	SerializeOptions,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

import { Provider, User } from '@prisma/client';
import { Response } from 'express';

import { AuthService } from './auth.service';
import {
	ApiAuthForgotPassword,
	ApiAuthLogin,
	ApiAuthLogout,
	ApiAuthRefresh,
	ApiAuthRegister,
	ApiAuthResetPassword,
	ApiAuthSendVerification,
	ApiAuthVerifyEmail,
} from './decorators/api-auth.decorator';
import {
	AuthResponseDto,
	RegisterDto,
	EmailVerifyDto,
	SendEmailDto,
	ResetPasswordDto,
} from './dto';
import {
	LocalAuthGuard,
	JwtRefreshAuthGuard,
	RecaptchaGuard,
	GoogleAuthGuard,
} from './guards';

import { UserEntity } from '@modules/user/entities/user.entity';
import { EnvironmentVariables } from '@config/env/environment-variables.config';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Authorization')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: UserEntity })
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService<EnvironmentVariables, true>
	) {}

	@ApiAuthRegister()
	@UseGuards(RecaptchaGuard)
	@Public()
	@Post('register')
	async register(@Body() dto: RegisterDto): Promise<void> {
		return this.authService.register(dto);
	}

	@ApiAuthLogin()
	@Public()
	@UseGuards(LocalAuthGuard, RecaptchaGuard)
	@HttpCode(HttpStatus.OK)
	@Post('login')
	login(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) res: Response
	): Promise<AuthResponseDto> {
		return this.authService.login(res, user);
	}

	@ApiExcludeEndpoint()
	@Public()
	@UseGuards(GoogleAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Get('google')
	googleAuth(): void {}

	@ApiExcludeEndpoint()
	@Public()
	@UseGuards(GoogleAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Get('google/callback')
	async googleAuthCallback(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) res: Response
	): Promise<void> {
		const { accessToken } = await this.authService.socialLogin(
			res,
			user,
			Provider.GOOGLE
		);
		const url = this.configService.get<string>('CLIENT_URL');

		return res.redirect(`${url}/google-success?accessToken=${accessToken}`);
	}

	@ApiAuthLogout()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Post('logout')
	logout(
		@CurrentUser() { id }: User,
		@Res({ passthrough: true }) res: Response
	): Promise<void> {
		return this.authService.logout(id, res);
	}

	@ApiAuthRefresh()
	@Public()
	@UseGuards(JwtRefreshAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('refresh')
	refresh(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) res: Response
	): Promise<AuthResponseDto> {
		return this.authService.refreshTokens(user, res);
	}

	@ApiAuthSendVerification()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Public()
	@Post('send-verification')
	sendVerificationEmail(@Body() { email }: SendEmailDto): Promise<void> {
		return this.authService.sendVerificationEmail(email);
	}

	@ApiAuthVerifyEmail()
	@Public()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Post('verify-email')
	verifyEmail(@Body() { email, token }: EmailVerifyDto): Promise<void> {
		return this.authService.verifyEmail(email, token);
	}

	@ApiAuthForgotPassword()
	@Public()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Post('forgot-password')
	sendPasswordResetEmail(@Body() { email }: SendEmailDto): Promise<void> {
		return this.authService.sendPasswordResetEmail(email);
	}

	@ApiAuthResetPassword()
	@Public()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Post('reset-password')
	resetPassword(
		@Body() { email, token, password }: ResetPasswordDto
	): Promise<void> {
		return this.authService.resetPassword(email, token, password);
	}
}
