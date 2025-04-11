import {
	MappingProperty,
	MappingTypeMapping,
} from '@elastic/elasticsearch/lib/api/types';

const textProperty: MappingProperty = {
	type: 'text',
	analyzer: 'autocomplete',
	search_analyzer: 'autocomplete',
};

export const eventMapping: MappingTypeMapping = {
	properties: {
		title: textProperty,
		description: textProperty,
		location: textProperty,
		id: { type: 'keyword' },
		companyId: { type: 'keyword' },
		status: { type: 'keyword' },
		startDate: { type: 'date' },
		endDate: { type: 'date' },
	},
};
