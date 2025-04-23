import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';

import { Prisma, Provider, User } from '@prisma/client';
import { PrismaService } from '@modules/prisma/prisma.service';
import { RedisService } from '@modules/redis/redis.service';
import { UserService } from '@modules/user/user.service';
import { UserEntity } from '@modules/user/entities/user.entity';
import { MailService } from '@modules/mail/mail.service';
import { AuthResponseDto, RegisterDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AppConfig, appConfig } from '@modules/config/configs/app.config';
import { TOKEN_PREFIXES } from './constants/token-prefixes.constant';
import { COOKIE_NAMES } from './constants/cookie-names.constant';

import { CreateUserDto } from '@modules/user/dto';
import { NodeEnv } from '@common/enum/node-env.enum';
import { authConfig, AuthConfig } from '@modules/config/configs';

@Injectable()
export class AuthService {
	constructor(
		@Inject(authConfig.KEY)
		private readonly authConfig: ConfigType<AuthConfig>,
		@Inject(appConfig.KEY)
		private readonly appConfig: ConfigType<AppConfig>,
		private readonly prisma: PrismaService,
		private readonly redis: RedisService,
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly mailService: MailService
	) {}

	async register(dto: RegisterDto): Promise<void> {
		const { email } = await this.userService.create(dto);
		await this.sendVerificationEmail(email);
	}

	async login(user: User, res: Response): Promise<AuthResponseDto> {
		if (!user.verified) {
			throw new UnauthorizedException('User email is not verified');
		}

		const [accessToken, refreshToken] = await this.generateTokens({
			sub: user.id,
			email: user.email,
		});

		await this.updateRefreshToken(user, refreshToken, res);

		return {
			user: new UserEntity(user),
			accessToken,
		};
	}

	async socialLogin(
		data: User,
		provider: Provider,
		res: Response
	): Promise<AuthResponseDto> {
		try {
			const user = await this.userService.findByEmail(data.email);
			return this.login(user, res);
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				const dto = { ...data, provider, verified: true };
				const user = await this.userService.create(
					plainToInstance(CreateUserDto, dto, {
						excludeExtraneousValues: true,
					})
				);

				return this.login(user, res);
			}

			throw error;
		}
	}

	async logout(userId: number, res: Response): Promise<void> {
		await this.redis.del(TOKEN_PREFIXES.REFRESH, userId);
		res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN);
	}

	async refreshTokens(user: User, res: Response): Promise<AuthResponseDto> {
		const [accessToken, refreshToken] = await this.generateTokens({
			sub: user.id,
			email: user.email,
		});

		await this.updateRefreshToken(user, refreshToken, res);

		return {
			user: new UserEntity(user),
			accessToken,
		};
	}

	async verifyEmail(email: string, verifyToken: string): Promise<void> {
		const token = await this.redis.get<string>(TOKEN_PREFIXES.VERIFICATION, email);

		if (token?.toLowerCase() !== verifyToken.toLowerCase()) {
			throw new BadRequestException('Invalid email or token');
		}

		await this.prisma.user.update({
			where: {
				email,
			},
			data: {
				verified: true,
			},
		});
		await this.redis.del(TOKEN_PREFIXES.VERIFICATION, email);
	}

	async resetPassword(
		email: string,
		resetToken: string,
		password: string
	): Promise<void> {
		const token = await this.redis.get<string>(TOKEN_PREFIXES.RESET_PASSWORD, email);

		if (token?.toLowerCase() !== resetToken.toLowerCase()) {
			await this.checkResetPasswordRetries(email);
			throw new BadRequestException('Invalid email or token');
		}

		const salt = await bcrypt.genSalt();
		await this.prisma.user.update({
			where: {
				email,
			},
			data: {
				password: await bcrypt.hash(password, salt),
			},
		});
		await this.redis.del(TOKEN_PREFIXES.RESET_PASSWORD, email);
		await this.redis.del(`reset-retries`, email);
	}

	async validateUser(email: string, password: string): Promise<User> {
		const user = await this.userService.findByEmail(email);

		if (!user.password) {
			throw new UnauthorizedException();
		}

		const passwordMatch = await bcrypt.compare(password, user.password);

		if (!passwordMatch) {
			throw new BadRequestException('Invalid password');
		}

		return user;
	}

	async sendVerificationEmail(email: string): Promise<void> {
		const user = await this.userService.findByEmail(email);

		if (user.verified) {
			return;
		}

		const token = crypto.randomBytes(3).toString('hex').toUpperCase();
		const context = {
			username: user.username,
			token,
		};

		await this.redis.set(TOKEN_PREFIXES.VERIFICATION, user.email, token, 15 * 60);

		await this.mailService.sendMail({
			to: user.email,
			subject: 'Account verification',
			templateName: 'verification',
			context,
		});
	}

	async sendPasswordResetEmail(email: string): Promise<void> {
		const { username } = await this.userService.findByEmail(email);
		const token = crypto.randomBytes(3).toString('hex').toUpperCase();
		const context = {
			username,
			token,
		};

		await this.redis.set(TOKEN_PREFIXES.RESET_PASSWORD, email, token, 15 * 60);

		await this.mailService.sendMail({
			to: email,
			subject: 'Password reset',
			templateName: 'password-reset',
			context,
		});
	}

	private async updateRefreshToken(
		user: User,
		token: string,
		res: Response
	): Promise<void> {
		const exp = this.authConfig.jwt.refresh.expiration;
		const salt = await bcrypt.genSalt();

		await this.redis.set(
			TOKEN_PREFIXES.REFRESH,
			user.id,
			await bcrypt.hash(token, salt),
			exp
		);

		res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, {
			httpOnly: true,
			sameSite: 'lax',
			secure: this.appConfig.env === NodeEnv.PROD,
			maxAge: exp * 1000,
		});
	}

	private async checkResetPasswordRetries(email: string) {
		const prefix = `reset-retries`;
		const retries = await this.redis.incr(prefix, email);

		if (retries === 1) {
			await this.redis.expire(prefix, email, 15 * 60);
		}

		if (retries > 5) {
			await this.redis.del(TOKEN_PREFIXES.RESET_PASSWORD, email);
			throw new ForbiddenException('Too many failed attempts. Try again later.');
		}
	}

	private async generateTokens(payload: JwtPayload): Promise<[string, string]> {
		return Promise.all([
			this.jwtService.signAsync(payload, {
				secret: this.authConfig.jwt.access.secret,
				expiresIn: this.authConfig.jwt.access.expiration,
			}),
			this.jwtService.signAsync(payload, {
				secret: this.authConfig.jwt.refresh.secret,
				expiresIn: this.authConfig.jwt.refresh.expiration,
			}),
		]);
	}
}
