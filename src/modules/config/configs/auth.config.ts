import { registerAs } from '@nestjs/config';
import { IsString, IsNotEmpty, IsPositive, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

import { validateConfig } from './validate-config';

class AuthEnvironmentVariables {
	@IsString()
	@IsNotEmpty()
	readonly JWT_ACCESS_SECRET: string;

	@IsInt()
	@IsPositive()
	@Transform(({ value }) => Number(value))
	readonly JWT_ACCESS_EXPIRATION: number;

	@IsString()
	@IsNotEmpty()
	readonly JWT_REFRESH_SECRET: string;

	@IsInt()
	@IsPositive()
	@Transform(({ value }) => Number(value))
	readonly JWT_REFRESH_EXPIRATION: number;

	@IsString()
	@IsNotEmpty()
	readonly GOOGLE_CLIENT_ID: string;

	@IsString()
	@IsNotEmpty()
	readonly GOOGLE_CLIENT_SECRET: string;

	@IsString()
	@IsNotEmpty()
	readonly GOOGLE_CALLBACK_URL: string;

	@IsString()
	@IsNotEmpty()
	readonly GOOGLE_RECAPTCHA_SECRET_KEY: string;
}

interface IAuth {
	jwt: {
		access: {
			secret: string;
			expiration: number;
		};
		refresh: {
			secret: string;
			expiration: number;
		};
	};
	google: {
		clientId: string;
		clientSecret: string;
		callbackUrl: string;
	};
	recaptcha: {
		secret: string;
	};
}

export const authConfig = registerAs<IAuth>('auth', async () => {
	const env = await validateConfig(AuthEnvironmentVariables);
	return {
		jwt: {
			access: {
				secret: env.JWT_ACCESS_SECRET,
				expiration: env.JWT_ACCESS_EXPIRATION,
			},
			refresh: {
				secret: env.JWT_REFRESH_SECRET,
				expiration: env.JWT_REFRESH_EXPIRATION,
			},
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			callbackUrl: env.GOOGLE_CALLBACK_URL,
		},
		recaptcha: {
			secret: env.GOOGLE_RECAPTCHA_SECRET_KEY,
		},
	};
});

export type AuthConfig = typeof authConfig;
