import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CacheOptions } from '@nestjs/cache-manager';
import KeyvRedis, { Keyv, RedisClientOptions } from '@keyv/redis';

import { AppConfig } from '@modules/config/env/app.config';
import { ConfigFactory } from './abstract-config.factory';

@Injectable()
export class CacheConfigFactory implements ConfigFactory<CacheOptions> {
	constructor(private readonly configService: ConfigService<AppConfig, true>) {}

	createOptions() {
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
