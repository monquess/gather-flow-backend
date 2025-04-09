import { registerAs } from '@nestjs/config';
import {
	IsString,
	IsNumber,
	Min,
	Max,
	IsNotEmpty,
	IsPositive,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { validateConfig } from './validate-config';

class RedisEnvironmentVariables {
	@IsString()
	@IsNotEmpty()
	readonly REDIS_HOST: string;

	@IsNumber()
	@Min(0)
	@Max(65535)
	@Transform(({ value }) => Number(value))
	readonly REDIS_PORT: number;

	@IsString()
	@IsNotEmpty()
	readonly REDIS_PASSWORD: string;

	@IsNumber()
	@IsPositive()
	@Transform(({ value }) => Number(value))
	readonly CACHE_TTL: number;
}

interface IRedis {
	host: string;
	port: number;
	password: string;
	cache: {
		ttl: number;
	};
}

export const redisConfig = registerAs<IRedis>('redis', async () => {
	const env = await validateConfig(RedisEnvironmentVariables);
	return {
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
		password: env.REDIS_PASSWORD,
		cache: {
			ttl: env.CACHE_TTL,
		},
	};
});

export type RedisConfig = typeof redisConfig;
