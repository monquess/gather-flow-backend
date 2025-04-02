import { RedisOptions } from 'ioredis';

export interface RedisOptionsFactory {
	createRedisOptions: () => Promise<RedisOptions> | RedisOptions;
}
