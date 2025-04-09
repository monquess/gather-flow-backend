import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';

import { validateConfig } from './validate-config';

class StorageEnvironmentVariables {
	@IsString()
	readonly S3_ACCESS_KEY_ID: string;

	@IsString()
	readonly S3_SECRET_ACCESS_KEY: string;

	@IsString()
	readonly S3_REGION: string;

	@IsString()
	readonly S3_BUCKET_NAME: string;

	@IsString()
	readonly S3_ENDPOINT: string;
}

interface IStorage {
	access: {
		id: string;
		secret: string;
	};
	region: string;
	bucket: string;
	endpoint: string;
}

export const storageConfig = registerAs<IStorage>('storage', async () => {
	const env = await validateConfig(process.env, StorageEnvironmentVariables);
	return {
		access: {
			id: env.S3_ACCESS_KEY_ID,
			secret: env.S3_SECRET_ACCESS_KEY,
		},
		region: env.S3_REGION,
		bucket: env.S3_BUCKET_NAME,
		endpoint: env.S3_ENDPOINT,
	};
});

export type StorageConfig = typeof storageConfig;
