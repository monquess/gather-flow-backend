import { ModuleMetadata, Type } from '@nestjs/common';
import { RedisOptions } from 'ioredis';
import { RedisOptionsFactory } from './redis-options-factory.interface';

export interface RedisAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
	inject?: any[];
	useClass?: Type<RedisOptionsFactory>;
	useExisting?: Type<RedisOptionsFactory>;
	useFactory?: (...args: any[]) => Promise<RedisOptions> | RedisOptions;
}
