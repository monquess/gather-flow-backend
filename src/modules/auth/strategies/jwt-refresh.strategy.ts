import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import * as bcrypt from 'bcryptjs';
import { Request } from 'express';

import { RedisService } from '@modules/redis/redis.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import { authConfig, AuthConfig } from '@modules/config/configs';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { TOKEN_PREFIXES } from '../constants/token-prefixes.constant';
import { COOKIE_NAMES } from '../constants/cookie-names.constant';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh'
) {
	constructor(
		@Inject(authConfig.KEY)
		private readonly config: ConfigType<AuthConfig>,
		private readonly prisma: PrismaService,
		private readonly redis: RedisService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) => {
					return req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] as string | null;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: config.jwt.refresh.secret,
			passReqToCallback: true,
		});
	}

	async validate(req: Request, payload: JwtPayload) {
		const token = await this.redis.get<string>(
			TOKEN_PREFIXES.REFRESH,
			payload.sub
		);
		const user = await this.prisma.user.findUnique({
			where: {
				id: payload.sub,
			},
		});

		if (!user || !token) {
			throw new UnauthorizedException('User not found');
		}

		const tokensMatch = await bcrypt.compare(
			req.cookies[COOKIE_NAMES.REFRESH_TOKEN] as string,
			token
		);

		if (!tokensMatch) {
			throw new UnauthorizedException('Invalid refresh token');
		}

		return user;
	}
}
