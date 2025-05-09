import {
	MappingProperty,
	MappingTypeMapping,
} from '@elastic/elasticsearch/lib/api/types';

const autocompleteTextProperty: MappingProperty = {
	type: 'text',
	term_vector: 'yes',
	analyzer: 'autocomplete',
	search_analyzer: 'autocomplete',
	fields: {
		keyword: {
			type: 'keyword',
			ignore_above: 256,
		},
	},
};

const dateProperty: MappingProperty = {
	type: 'date',
	format: 'strict_date_optional_time',
};

export const eventMapping: MappingTypeMapping = {
	properties: {
		title: autocompleteTextProperty,
		location: autocompleteTextProperty,
		description: {
			type: 'text',
			term_vector: 'yes',
			analyzer: 'description_autocomplete',
			search_analyzer: 'standard',
			fields: {
				keyword: {
					type: 'keyword',
					ignore_above: 256,
				},
			},
		},
		companyId: {
			type: 'integer',
		},
		status: {
			type: 'keyword',
		},
		format: {
			type: 'keyword',
		},
		theme: {
			type: 'keyword',
		},
		ticketPrice: {
			type: 'scaled_float',
			scaling_factor: 100,
		},
		ticketQuantity: {
			type: 'integer',
		},
		startDate: dateProperty,
		endDate: dateProperty,
		publishDate: dateProperty,
	},
} as const;
