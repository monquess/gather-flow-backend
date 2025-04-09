import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { CacheOptions } from '@nestjs/cache-manager';
import KeyvRedis, { Keyv, RedisClientOptions } from '@keyv/redis';

import { ConfigFactory } from '../interface/config-factory.interface';
import { redisConfig, RedisConfig } from '../configs/redis.config';

@Injectable()
export class CacheConfigFactory implements ConfigFactory<CacheOptions> {
	constructor(
		@Inject(redisConfig.KEY)
		private readonly config: ConfigType<RedisConfig>
	) {}

	createOptions(): CacheOptions {
		const options: RedisClientOptions = {
			password: this.config.password,
			socket: {
				host: this.config.host,
				port: this.config.port,
			},
			database: 1,
		};

		return {
			stores: [
				new Keyv({
					store: new KeyvRedis(options),
					namespace: 'cache',
					useKeyPrefix: false,
					ttl: this.config.cache.ttl,
				}),
			],
		};
	}
}
