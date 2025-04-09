import { registerAs } from '@nestjs/config';
import { validate } from './app.config';
import { IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

class RedisEnvironmentVariables {
	@IsString()
	readonly REDIS_HOST: string;

	@IsNumber()
	@Transform(({ value }) => Number(value))
	readonly CACHE_TTL: number;

	@IsNumber()
	@Min(0)
	@Max(65535)
	@Transform(({ value }) => Number(value))
	readonly REDIS_PORT: number;

	@IsString()
	readonly REDIS_PASSWORD: string;
}

interface IRedis {
	host: string;
	port: number;
	password: string;
	cache: {
		ttl: number;
	};
}

export const redisConfig = registerAs<IRedis>('redis', () => {
	const env = validate(process.env, RedisEnvironmentVariables);
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
