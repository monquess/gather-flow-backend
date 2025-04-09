import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { QueueOptions } from 'bullmq';

import { ConfigFactory } from '../interface/config-factory.interface';
import { redisConfig, RedisConfig } from '../configs/redis.config';

@Injectable()
export class BullConfigFactory implements ConfigFactory<QueueOptions> {
	constructor(
		@Inject(redisConfig.KEY)
		private readonly config: ConfigType<RedisConfig>
	) {}

	createOptions(): QueueOptions {
		return {
			connection: {
				host: this.config.host,
				port: this.config.port,
				password: this.config.password,
				db: 2,
			},
		};
	}
}
