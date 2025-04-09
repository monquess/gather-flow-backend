import { registerAs } from '@nestjs/config';
import { validate } from './app.config';
import { IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

class DatabaseEnvironmentVariables {
	@IsString()
	readonly DATABASE_USER: string;

	@IsString()
	readonly DATABASE_PASSWORD: string;

	@IsString()
	readonly DATABASE_HOST: string;

	@IsNumber()
	@Min(0)
	@Max(65535)
	@Transform(({ value }) => Number(value))
	readonly DATABASE_PORT: number;

	@IsString()
	readonly DATABASE_NAME: string;

	@IsString()
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

export const databaseConfig = registerAs<IDatabase>('database', () => {
	const env = validate(process.env, DatabaseEnvironmentVariables);
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
