import { Inject, Injectable } from '@nestjs/common';
import { ElasticsearchModuleOptions } from '@nestjs/elasticsearch';
import { ConfigType } from '@nestjs/config';

import { ConfigFactory } from '../interface/config-factory.interface';
import {
	ElasticsearchConfig,
	elasticsearchConfig,
} from '../configs/elasticsearch.config';

@Injectable()
export class ElasticsearchConfigFactory
	implements ConfigFactory<ElasticsearchModuleOptions>
{
	constructor(
		@Inject(elasticsearchConfig.KEY)
		private readonly config: ConfigType<ElasticsearchConfig>
	) {}

	createOptions(): ElasticsearchModuleOptions {
		return {
			node: this.config.node.url,
			auth: this.config.auth,
		};
	}
}
