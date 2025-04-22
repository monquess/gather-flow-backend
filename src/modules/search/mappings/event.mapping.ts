import {
	MappingProperty,
	MappingTypeMapping,
} from '@elastic/elasticsearch/lib/api/types';

const textProperty: MappingProperty = {
	type: 'text',
	term_vector: 'yes',
	analyzer: 'autocomplete',
	search_analyzer: 'autocomplete',
};

export const eventMapping: MappingTypeMapping = {
	properties: {
		title: textProperty,
		description: textProperty,
		location: textProperty,
		companyId: { type: 'integer' },
		status: { type: 'keyword' },
		format: { type: 'keyword' },
		theme: { type: 'keyword' },
		ticketPrice: {
			type: 'scaled_float',
			scaling_factor: 100,
		},
		ticketQuantity: { type: 'integer' },
		startDate: {
			type: 'date',
			format: 'strict_date_optional_time',
		},
		endDate: {
			type: 'date',
			format: 'strict_date_optional_time',
		},
	},
} as const;
