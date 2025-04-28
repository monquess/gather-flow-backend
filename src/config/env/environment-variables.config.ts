import {
	IsEnum,
	IsString,
	IsNumber,
	Max,
	Min,
	validateSync,
	IsBoolean,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

export enum Environment {
	DEVELOPMENT = 'development',
	PRODUCTION = 'production',
}

export class EnvironmentVariables {
	@IsEnum(Environment)
	readonly NODE_ENV: Environment = Environment.DEVELOPMENT;

	@IsNumber()
	@Min(0)
	@Max(65535)
	@Transform(({ value }) => Number(value))
	readonly PORT: number = 3000;

	@IsString()
	readonly APP_URL: string;

	@IsString()
	readonly CLIENT_URL: string;

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

	@IsString()
	readonly REDIS_HOST: string;

	@IsNumber()
	@Transform(({ value }) => Number(value))
	readonly CACHE_TTL: number;

	@IsNumber()
	@Min(0)
	@Max(65535)
	@Transform(({ value }) => Number(value))
	readonly REDIS_PORT: number;

	@IsString()
	readonly REDIS_PASSWORD: string;

	@IsString()
	readonly JWT_ACCESS_SECRET: string;

	@IsNumber()
	@Transform(({ value }) => Number(value))
	readonly JWT_ACCESS_EXPIRATION: number;

	@IsString()
	readonly JWT_REFRESH_SECRET: string;

	@IsNumber()
	@Transform(({ value }) => Number(value))
	readonly JWT_REFRESH_EXPIRATION: number;

	@IsString()
	readonly MAIL_HOST: string;

	@IsNumber()
	@Min(0)
	@Max(65535)
	@Transform(({ value }) => Number(value))
	readonly MAIL_PORT: number;

	@IsString()
	readonly MAIL_USERNAME: string;

	@IsString()
	readonly MAIL_PASSWORD: string;

	@IsBoolean()
	readonly MAIL_ENCRYPTION: boolean;

	@IsString()
	readonly MAIL_FROM_ADDRESS: string;

	@IsString()
	readonly MAIL_FROM_NAME: string;

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

	@IsString()
	readonly DEFAULT_AVATAR_PATH: string;

	@IsString()
	readonly DEFAULT_POSTER_PATH: string;

	@IsString()
	readonly GOOGLE_CLIENT_ID: string;

	@IsString()
	readonly GOOGLE_CLIENT_SECRET: string;

	@IsString()
	readonly GOOGLE_CALLBACK_URL: string;

	@IsString()
	readonly GOOGLE_RECAPTCHA_SECRET_KEY: string;

	@IsString()
	readonly STRIPE_PUBLIC_KEY: string;

	@IsString()
	readonly STRIPE_SECRET_KEY: string;

	@IsString()
	readonly STRIPE_WEBHOOK_KEY: string;

	@IsString()
	readonly STRIPE_CLIENT_ID: string;
}

export function validate(config: Record<string, unknown>) {
	const validatedConfig = plainToInstance(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	});
	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false,
	});

	if (errors.length > 0) {
		throw new Error(errors.toString());
	}

	return validatedConfig;
}
