import { HelmetOptions } from 'helmet';

export const helmetOptions: HelmetOptions = {
	contentSecurityPolicy: {
		useDefaults: true,
		directives: {
			'style-src': null,
		},
	},
};
