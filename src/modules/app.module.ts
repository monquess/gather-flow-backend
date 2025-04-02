import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';

import * as path from 'path';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { S3Module } from './s3/s3.module';
import { NotificationModule } from './notification/notification.module';
import { MailModule } from './mail/mail.module';
import { MailOptions } from './mail/interfaces/mail-options.interface';
import { CacheConfigFactory } from './config/factories/cache-config.factory';
import { ConfigModule } from './config/config.module';

import { EnvironmentVariables } from '@config/env/environment-variables.config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
	imports: [
		CacheModule.registerAsync({
			isGlobal: true,
			useFactory: (factory: CacheConfigFactory) => {
				return factory.createCacheOptions();
			},
			inject: [CacheConfigFactory],
			imports: [ConfigModule],
		}),
		PrismaModule,
		UserModule,
		AuthModule,
		S3Module,
		MailModule.forRootAsync({
			isGlobal: true,
			useFactory: (
				configService: ConfigService<EnvironmentVariables, true>
			): MailOptions => ({
				transport: {
					host: configService.get<string>('MAIL_HOST'),
					port: configService.get<number>('MAIL_PORT'),
					auth: {
						user: configService.get<string>('MAIL_USERNAME'),
						pass: configService.get<string>('MAIL_PASSWORD'),
					},
				},
				defaults: {
					from: {
						name: configService.get<string>('MAIL_FROM_NAME'),
						address: configService.get<string>('MAIL_FROM_ADDRESS'),
					},
				},
				template: {
					dir: path.join(__dirname, 'mail', 'templates'),
				},
			}),
			inject: [ConfigService],
		}),
		NotificationModule,
		BullModule.forRootAsync({
			useFactory: (configService: ConfigService) => ({
				connection: {
					host: configService.get<string>('REDIS_HOST'),
					port: configService.get<number>('REDIS_PORT'),
					password: configService.get<string>('REDIS_PASSWORD'),
				},
			}),
			inject: [ConfigService],
		}),
		ConfigModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
