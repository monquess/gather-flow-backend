import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { CacheConfigFactory } from './factories/cache-config.factory';
import { validate } from '@config/env/environment-variables.config';

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
	providers: [CacheConfigFactory],
	exports: [NestConfigModule, CacheConfigFactory],
})
export class ConfigModule {}
