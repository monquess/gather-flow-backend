import { registerAs } from '@nestjs/config';
import { IsString, Min, Max, IsNotEmpty, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

import { validateConfig } from './validate-config';

class ElasticsearchEnvironmentVariables {
	@IsString()
	@IsNotEmpty()
	readonly ELASTICSEARCH_NODE: string;

	@IsString()
	@IsNotEmpty()
	readonly ELASTICSEARCH_NODE_NAME: string;

	@IsString()
	@IsNotEmpty()
	readonly ELASTICSEARCH_USERNAME: string;

	@IsString()
	@IsNotEmpty()
	readonly ELASTICSEARCH_PASSWORD: string;

	@IsInt()
	@Min(0)
	@Max(65535)
	@Transform(({ value }) => Number(value))
	readonly ELASTICSEARCH_PORT: number;
}

interface IElasticsearch {
	port: number;
	auth: {
		username: string;
		password: string;
	};
	node: {
		name: string;
		url: string;
	};
}

export const elasticsearchConfig = registerAs<IElasticsearch>(
	'elasticsearch',
	async () => {
		const env = await validateConfig(ElasticsearchEnvironmentVariables);
		return {
			port: env.ELASTICSEARCH_PORT,
			auth: {
				username: env.ELASTICSEARCH_USERNAME,
				password: env.ELASTICSEARCH_PASSWORD,
			},
			node: {
				name: env.ELASTICSEARCH_NODE_NAME,
				url: env.ELASTICSEARCH_NODE,
			},
		};
	}
);

export type ElasticsearchConfig = typeof elasticsearchConfig;
