import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from '@config/env/environment-variables.config';
import KeyvRedis, { Keyv, RedisClientOptions } from '@keyv/redis';
import { CacheOptions } from '@nestjs/cache-manager';

interface CacheOptionsFactory {
	createCacheOptions(): Promise<CacheOptions> | CacheOptions;
}

@Injectable()
export class CacheConfigFactory implements CacheOptionsFactory {
	constructor(
		private readonly configService: ConfigService<EnvironmentVariables, true>
	) {}

	createCacheOptions() {
		const options: RedisClientOptions = {
			password: this.configService.get<string>('REDIS_PASSWORD'),
			socket: {
				host: this.configService.get<string>('REDIS_HOST'),
				port: this.configService.get<number>('REDIS_PORT'),
			},
		};
		return {
			stores: [
				new Keyv({
					store: new KeyvRedis(options),
					namespace: 'cache',
					useKeyPrefix: false,
					ttl: this.configService.get<number>('CACHE_TTL'),
				}),
			],
		};
	}
}
