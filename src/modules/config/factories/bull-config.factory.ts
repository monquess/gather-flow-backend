import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { QueueOptions } from 'bullmq';
import { AppConfig } from '@modules/config/env/app.config';
import { ConfigFactory } from './abstract-config.factory';

@Injectable()
export class BullConfigFactory implements ConfigFactory<QueueOptions> {
	constructor(private readonly configService: ConfigService<AppConfig, true>) {}

	createOptions() {
		return {
			connection: {
				host: this.configService.get<string>('REDIS_HOST'),
				port: this.configService.get<number>('REDIS_PORT'),
				password: this.configService.get<string>('REDIS_PASSWORD'),
			},
		};
	}
}
