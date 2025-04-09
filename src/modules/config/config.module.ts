import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import {
	CacheConfigFactory,
	BullConfigFactory,
	MailConfigFactory,
	RedisConfigFactory,
} from './factories';
import {
	appConfig,
	redisConfig,
	mailConfig,
	authConfig,
	storageConfig,
	databaseConfig,
} from './configs';

@Global()
@Module({
	imports: [
		NestConfigModule.forRoot({
			cache: true,
			load: [
				appConfig,
				redisConfig,
				mailConfig,
				authConfig,
				storageConfig,
				databaseConfig,
			],
		}),
	],
	providers: [
		CacheConfigFactory,
		MailConfigFactory,
		BullConfigFactory,
		RedisConfigFactory,
	],
	exports: [
		NestConfigModule,
		CacheConfigFactory,
		MailConfigFactory,
		BullConfigFactory,
		RedisConfigFactory,
	],
})
export class ConfigModule {}
