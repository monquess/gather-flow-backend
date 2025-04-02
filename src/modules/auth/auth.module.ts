import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { PrismaModule } from '@modules/prisma/prisma.module';
import { RedisModule } from '@modules/redis/redis.module';
import { UserModule } from '@modules/user/user.module';

import {
	LocalStrategy,
	JwtAccessStrategy,
	JwtRefreshStrategy,
	GoogleStrategy,
} from './strategies';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
	imports: [
		JwtModule.register({
			global: true,
		}),
		RedisModule.registerAsync({
			useFactory: (configService: ConfigService) => ({
				host: configService.get<string>('REDIS_HOST'),
				port: configService.get<number>('REDIS_PORT'),
				password: configService.get<string>('REDIS_PASSWORD'),
			}),
			inject: [ConfigService],
		}),
		PrismaModule,
		UserModule,
		HttpModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		LocalStrategy,
		JwtAccessStrategy,
		JwtRefreshStrategy,
		GoogleStrategy,
	],
})
export class AuthModule {}
