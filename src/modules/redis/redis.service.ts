import { Inject, Injectable } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';
import { REDIS_OPTIONS } from './constants/redis.constants';

@Injectable()
export class RedisService {
	private client: Redis;

	constructor(@Inject(REDIS_OPTIONS) private readonly options: RedisOptions) {
		this.client = new Redis(options);
	}

	onModuleDestroy() {
		if (this.client) {
			this.client.disconnect();
		}
	}

	async get<T = string>(
		prefix: string,
		key: string | number
	): Promise<T | null> {
		const value = await this.client.get(`${prefix}:${key}`);

		if (!value) {
			return null;
		}

		try {
			return JSON.parse(value) as T;
		} catch {
			return null;
		}
	}

	async set<T = string>(
		prefix: string,
		key: string | number,
		value: T,
		ttl?: number
	): Promise<void> {
		const setValue = JSON.stringify(value);

		if (ttl) {
			await this.client.set(`${prefix}:${key}`, setValue, 'EX', ttl);
		} else {
			await this.client.set(`${prefix}:${key}`, setValue);
		}
	}

	async del(prefix: string, key: string | number): Promise<void> {
		await this.client.del(`${prefix}:${key}`);
	}

	async incr(prefix: string, key: string | number): Promise<number> {
		return this.client.incr(`${prefix}:${key}`);
	}

	async expire(
		prefix: string,
		key: string | number,
		seconds: string | number
	): Promise<void> {
		await this.client.expire(`${prefix}:${key}`, seconds);
	}
}
