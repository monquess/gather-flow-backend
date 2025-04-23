import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';

import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { S3Module } from './s3/s3.module';
import { NotificationModule } from './notification/notification.module';
import { MailModule } from './mail/mail.module';
import { CompanyModule } from './company/company.module';
import { EventModule } from './event/event.module';
import { ConfigModule } from './config/config.module';
import {
	CacheConfigFactory,
	MailConfigFactory,
	BullConfigFactory,
} from './config/factories';
import { SearchModule } from './search/search.module';
import { PostModule } from './post/post.module';

@Module({
	imports: [
		CacheModule.registerAsync({
			isGlobal: true,
			useFactory: (factory: CacheConfigFactory) => {
				return factory.createOptions();
			},
			inject: [CacheConfigFactory],
		}),
		MailModule.forRootAsync({
			isGlobal: true,
			useFactory: (factory: MailConfigFactory) => {
				return factory.createOptions();
			},
			inject: [MailConfigFactory],
		}),
		BullModule.forRootAsync({
			useFactory: (factory: BullConfigFactory) => {
				return factory.createOptions();
			},
			inject: [BullConfigFactory],
		}),
		ConfigModule,
		PrismaModule,
		UserModule,
		AuthModule,
		S3Module,
		NotificationModule,
		CompanyModule,
		EventModule,
		SearchModule,
		PostModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
