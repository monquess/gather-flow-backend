import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisOptions } from 'ioredis';

import { AppConfig } from '@modules/config/env/app.config';
import { ConfigFactory } from './abstract-config.factory';

@Injectable()
export class RedisConfigFactory implements ConfigFactory<RedisOptions> {
	constructor(private readonly configService: ConfigService<AppConfig, true>) {}

	createOptions(): RedisOptions {
		return {
			host: this.configService.get<string>('REDIS_HOST'),
			port: this.configService.get<number>('REDIS_PORT'),
			password: this.configService.get<string>('REDIS_PASSWORD'),
		};
	}
}
