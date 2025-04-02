import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisOptions } from 'ioredis';
import { REDIS_OPTIONS } from './constants/redis.constants';
import { RedisAsyncOptions } from './interfaces/redis-async-options.interface';
import { RedisOptionsFactory } from './interfaces/redis-options-factory.interface';

@Module({})
export class RedisModule {
	public static register(options: RedisOptions): DynamicModule {
		return {
			module: RedisModule,
			providers: [
				RedisService,
				{
					provide: REDIS_OPTIONS,
					useValue: options,
				},
			],
			exports: [RedisService],
		};
	}
	public static registerAsync(options: RedisAsyncOptions): DynamicModule {
		const providers: Provider[] = this.createAsyncProviders(options);

		return {
			module: RedisModule,
			imports: options.imports || [],
			providers: [...providers, RedisService],
			exports: [RedisService],
		};
	}

	private static createAsyncProviders(options: RedisAsyncOptions): Provider[] {
		const providers: Provider[] = [this.createAsyncOptionsProvider(options)];

		if (options.useClass) {
			providers.push({
				provide: options.useClass,
				useClass: options.useClass,
			});
		}

		return providers;
	}

	private static createAsyncOptionsProvider(
		options: RedisAsyncOptions
	): Provider {
		if (options.useFactory) {
			return {
				provide: REDIS_OPTIONS,
				useFactory: options.useFactory,
				inject: options.inject || [],
			};
		}

		return {
			provide: REDIS_OPTIONS,
			useFactory: async (optionsFactory: RedisOptionsFactory) => {
				return optionsFactory.createRedisOptions();
			},
			inject: [options.useExisting! || options.useClass!],
		};
	}
}
