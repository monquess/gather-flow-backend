/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
	AnalysisAnalyzer,
	QueryDslQueryContainer,
} from '@elastic/elasticsearch/lib/api/types';
import { Event, EventStatus } from '@prisma/client';

import { EventFilteringOptionsDto } from '@modules/event/dto/filtering-options.dto';
import { CompanyEventFilteringOptionsDto } from '@modules/company/dto';
import { SearchService } from './abstract-search-service';
import { IndexName } from './enum';
import { eventMapping } from './mappings/event.mapping';
import { SortOrder } from '@common/enum/sort-order.enum';

@Injectable()
export class EventSearchService extends SearchService<Event> implements OnModuleInit {
	constructor(readonly es: ElasticsearchService) {
		super(es, IndexName.EVENTS);
	}

	async onModuleInit() {
		try {
			const exists = await this.es.indices.exists({
				index: this._index,
			});

			if (!exists) {
				const autocomplete: AnalysisAnalyzer = {
					type: 'custom',
					tokenizer: 'standard',
					filter: ['lowercase', 'asciifolding', 'autocomplete_filter'],
				};

				await this.es.indices.create({
					index: this._index,
					body: {
						settings: {
							max_ngram_diff: 17,
							analysis: {
								filter: {
									autocomplete_filter: {
										type: 'edge_ngram',
										min_gram: 3,
										max_gram: 20,
									},
								},
								analyzer: {
									autocomplete,
									description_autocomplete: {
										...autocomplete,
										char_filter: ['html_strip'],
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
				throw new Error(`Failed to initialize ${this._index} index: ${error.message}`);
			}
		}
	}

	async search(
		options:
			| EventFilteringOptionsDto
			| (CompanyEventFilteringOptionsDto & { companyId: number }),
		sort: string,
		order: SortOrder,
		page: number,
		limit: number
	): Promise<[Event[], number]> {
		const { hits } = await this.es.search<Omit<Event, 'id'>>({
			index: this._index,
			body: {
				query: this.buildQuery(options),
			},
			from: (page - 1) * limit,
			size: limit,
			sort: [
				{
					[this.getSortableField(sort)]: { order },
				},
				{
					_score: {
						order: 'desc',
					},
				},
			],
		});

		const events = hits.hits.map((hit) => {
			return {
				id: Number(hit._id),
				...hit._source,
			} as Event;
		});

		let total = 0;
		if (hits.total !== undefined) {
			total = typeof hits.total === 'number' ? hits.total : hits.total.value;
		}

		return [events, total];
	}

	async similar(id: string, limit: number): Promise<Event[]> {
		const { _source } = await this.es.get<Omit<Event, 'id'>>({
			index: this._index,
			id,
		});
		const { hits } = await this.es.search<Omit<Event, 'id'>>({
			index: this._index,
			body: {
				query: {
					bool: {
						should: [
							{
								more_like_this: {
									fields: ['title^3', 'description^1', 'location^2'],
									like: [
										{
											_index: this._index,
											doc: _source,
										},
									],
									min_term_freq: 1,
									min_doc_freq: 1,
									boost: 3,
								},
							},
							{
								term: {
									theme: {
										value: _source?.theme,
										boost: 1.5,
									},
								},
							},
							{
								term: {
									format: {
										value: _source?.format,
										boost: 1,
									},
								},
							},
						],
						must_not: [{ term: { id } }],
						filter: [
							{
								term: {
									status: EventStatus.PUBLISHED,
								},
							},
						],
						minimum_should_match: 1,
					},
				},
			},
			size: limit,
		});

		return hits.hits.map((hit) => {
			return {
				id: Number(hit._id),
				...hit._source,
			} as Event;
		});
	}

	private buildQuery(
		options: EventFilteringOptionsDto | CompanyEventFilteringOptionsDto
	): QueryDslQueryContainer {
		const entries = Object.entries(options).filter(([_, value]) => value !== undefined);
		const must = entries.map<QueryDslQueryContainer>(([key, value]) => {
			if (key === 'query') {
				return {
					multi_match: {
						query: value,
						fields: ['title^4', 'description^2', 'location'],
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

			if (key.toLowerCase().includes('price')) {
				const operator = key === 'minPrice' ? 'gte' : 'lte';
				return {
					range: {
						ticketPrice: {
							[operator]: value,
						},
					},
				};
			}

			if (key === 'status' || key === 'companyId') {
				return {
					term: {
						[key]: value,
					},
				};
			}

			return {
				terms: {
					[key]: value,
				},
			};
		});

		if (must.length === 0) {
			return { match_all: {} };
		}

		return {
			bool: {
				must,
			},
		};
	}

	private getSortableField = (field: string): string => {
		const textFields = ['title', 'location', 'description'];
		return textFields.includes(field) ? `${field}.keyword` : field;
	};
}
