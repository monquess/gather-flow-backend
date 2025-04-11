import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

import { ElasticsearchConfigFactory } from '@modules/config/factories/elasticsearch-config.factory';
import { EventSearchService } from './event-search.service';

@Module({
	imports: [
		ElasticsearchModule.registerAsync({
			useFactory: (factory: ElasticsearchConfigFactory) => {
				return factory.createOptions();
			},
			inject: [ElasticsearchConfigFactory],
		}),
	],
	providers: [EventSearchService],
	exports: [EventSearchService],
})
export class SearchModule {}
