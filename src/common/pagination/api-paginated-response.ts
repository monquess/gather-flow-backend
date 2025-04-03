import { applyDecorators, Type } from '@nestjs/common';
import {
	ApiExtraModels,
	ApiOkResponse,
	ApiQuery,
	getSchemaPath,
} from '@nestjs/swagger';
import { Paginated } from './paginated';
import { PaginatedMetadata } from './paginated-metadata';

export const ApiPaginatedResponse = <T>(itemType: Type<T>) =>
	applyDecorators(
		ApiExtraModels(Paginated, itemType),
		ApiQuery({ name: 'page', required: false, example: 1, type: Number }),
		ApiQuery({ name: 'limit', required: false, example: 10, type: Number }),
		ApiOkResponse({
			schema: {
				allOf: [
					{ $ref: getSchemaPath(Paginated) },
					{
						properties: {
							data: {
								type: 'array',
								items: { $ref: getSchemaPath(itemType) },
							},
							meta: {
								type: 'object',
								items: {
									$ref: getSchemaPath(PaginatedMetadata),
								},
							},
						},
					},
				],
			},
		})
	);
