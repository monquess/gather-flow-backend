import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { PrismaService } from '@modules/prisma/prisma.service';
import { AuthConfig, authConfig } from '@modules/config/configs';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		@Inject(authConfig.KEY)
		private readonly config: ConfigType<AuthConfig>,
		private readonly prisma: PrismaService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.jwt.access.secret,
		});
	}

	async validate(payload: JwtPayload): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
		});

		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}
}
