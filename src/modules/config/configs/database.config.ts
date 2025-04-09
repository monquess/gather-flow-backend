import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

import { validateConfig } from './validate-config';

class DatabaseEnvironmentVariables {
	@IsString()
	@IsNotEmpty()
	readonly DATABASE_USER: string;

	@IsString()
	@IsNotEmpty()
	readonly DATABASE_PASSWORD: string;

	@IsString()
	@IsNotEmpty()
	readonly DATABASE_HOST: string;

	@IsNumber()
	@Min(0)
	@Max(65535)
	@Transform(({ value }) => Number(value))
	readonly DATABASE_PORT: number;

	@IsString()
	@IsNotEmpty()
	readonly DATABASE_NAME: string;

	@IsString()
	@IsNotEmpty()
	readonly DATABASE_URL: string;
}

interface IDatabase {
	host: string;
	port: number;
	password: string;
	user: string;
	name: string;
	url: string;
}

export const databaseConfig = registerAs<IDatabase>('database', async () => {
	const env = await validateConfig(DatabaseEnvironmentVariables);
	return {
		host: env.DATABASE_HOST,
		port: env.DATABASE_PORT,
		password: env.DATABASE_PASSWORD,
		user: env.DATABASE_USER,
		name: env.DATABASE_NAME,
		url: env.DATABASE_URL,
	};
});

export type DatabaseConfig = typeof databaseConfig;
