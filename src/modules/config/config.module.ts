import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { validate } from '@modules/config/env/app.config';
import {
	CacheConfigFactory,
	BullConfigFactory,
	MailConfigFactory,
	RedisConfigFactory,
} from './factories';

@Global()
@Module({
	imports: [
		NestConfigModule.forRoot({
			cache: true,
			isGlobal: true,
			validate,
			validationOptions: {
				abortEarly: true,
			},
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
