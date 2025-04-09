import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { RedisOptions } from 'ioredis';

import { ConfigFactory } from './abstract-config.factory';
import { redisConfig, RedisConfig } from '../configs/redis.config';

@Injectable()
export class RedisConfigFactory implements ConfigFactory<RedisOptions> {
	constructor(
		@Inject(redisConfig.KEY)
		private readonly config: ConfigType<RedisConfig>
	) {}

	createOptions(): RedisOptions {
		return {
			host: this.config.host,
			port: this.config.port,
			password: this.config.password,
		};
	}
}
