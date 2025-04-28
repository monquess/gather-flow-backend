import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

import { PrismaModule } from '@modules/prisma/prisma.module';
import { RedisModule } from '@modules/redis/redis.module';
import { UserModule } from '@modules/user/user.module';
import { RedisConfigFactory } from '@modules/config/factories';

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
			useFactory: (factory: RedisConfigFactory) => {
				return factory.createOptions();
			},
			inject: [RedisConfigFactory],
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
