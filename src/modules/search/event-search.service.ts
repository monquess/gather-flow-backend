/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { Event } from '@prisma/client';

import { FilteringOptionsDto } from '@modules/event/dto/filtering-options.dto';
import { SearchService } from './abstract-search-service';
import { IndexName } from './enum';
import { eventMapping } from './mappings/event.mapping';

@Injectable()
export class EventSearchService
	extends SearchService<Event>
	implements OnModuleInit
{
	constructor(readonly es: ElasticsearchService) {
		super(es, IndexName.EVENTS);
	}

	async onModuleInit() {
		await this.initialize();
	}

	async initialize(): Promise<void> {
		try {
			const exists = await this.es.indices.exists({
				index: this._index,
			});

			if (!exists) {
				await this.es.indices.create({
					index: this._index,
					body: {
						settings: {
							max_ngram_diff: 19,
							analysis: {
								filter: {
									autocomplete_filter: {
										type: 'ngram',
										min_gram: 1,
										max_gram: 20,
									},
								},
								analyzer: {
									autocomplete: {
										type: 'custom',
										tokenizer: 'standard',
										filter: ['lowercase', 'autocomplete_filter'],
									},
								},
							},
						},
						mappings: eventMapping,
					},
				});
			}
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to initialize ${error.message} index`);
			}
		}
	}

	async search(
		options: FilteringOptionsDto,
		page: number,
		limit: number
	): Promise<Event[]> {
		const { hits } = await this.es.search<Omit<Event, 'id'>>({
			index: this._index,
			body: {
				query: this.buildQuery(options),
			},
			from: (page - 1) * limit,
			size: limit,
		});

		return hits.hits.map((hit) => {
			return {
				id: Number(hit._id),
				...hit._source,
			} as Event;
		});
	}

	private buildQuery(options: FilteringOptionsDto): QueryDslQueryContainer {
		const entries = Object.entries(options).filter(
			([_, value]) => value !== undefined
		);
		const must = entries.map<QueryDslQueryContainer>(([key, value]) => {
			if (key === 'query') {
				return {
					multi_match: {
						query: value,
						fields: ['title^3', 'description^2', 'location'],
						type: 'best_fields',
						operator: 'or',
					},
				};
			}

			if (key.toLowerCase().includes('date')) {
				const operator = key === 'startDate' ? 'gte' : 'lte';
				return {
					range: {
						[key]: {
							[operator]: value,
						},
					},
				};
			}

			return {
				term: {
					[key]: value,
				},
			};
		});

		return {
			bool: {
				must,
			},
		};
	}
}
