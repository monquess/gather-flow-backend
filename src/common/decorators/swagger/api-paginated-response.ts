import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { Paginated } from '../../pagination/paginated';
import { PaginatedMetadata } from '../../pagination/paginated-metadata';

export const ApiPaginatedResponse = <T>(itemType: Type<T>) =>
	applyDecorators(
		ApiExtraModels(Paginated, itemType),
		ApiQuery({
			type: Number,
			name: 'page',
			required: false,
			example: 1,
		}),
		ApiQuery({
			type: Number,
			name: 'limit',
			required: false,
			example: 10,
		}),
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
