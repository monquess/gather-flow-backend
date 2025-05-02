import { ElasticsearchService } from '@nestjs/elasticsearch';

import { SortOrder } from '@common/enum/sort-order.enum';
import { Document } from './interface/document.interface';

export abstract class SearchService<T extends Document> {
	protected readonly _index: string;

	constructor(
		protected readonly es: ElasticsearchService,
		index: string
	) {
		this._index = index;
	}

	abstract search(
		query: Record<string, unknown>,
		sort: string,
		order: SortOrder,
		page: number,
		limit: number
	): Promise<[T[], number]>;

	async index(document: T): Promise<void> {
		const { id, ...body } = document;
		await this.es.index({
			index: this._index,
			id: id.toString(),
			body,
		});
	}

	async indexBulk(documents: T[]): Promise<void> {
		await this.es.bulk({
			index: this._index,
			body: documents.flatMap((doc) => [{ index: { _id: doc.id.toString() } }, doc]),
		});
	}

	async update(document: T): Promise<void> {
		const { id, ...body } = document;

		await this.es.update({
			index: this._index,
			id: id.toString(),
			body: {
				doc: body,
			},
		});
	}

	async remove(document: T): Promise<void> {
		await this.es.delete({
			index: this._index,
			id: document.id.toString(),
		});
	}
}
