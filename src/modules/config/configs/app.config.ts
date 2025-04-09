import {
	IsEnum,
	IsString,
	IsNumber,
	Max,
	Min,
	validateSync,
} from 'class-validator';
import {
	ClassConstructor,
	plainToInstance,
	Transform,
} from 'class-transformer';
import { NodeEnv } from '@common/enum/node-env.enum';
import { registerAs } from '@nestjs/config';

export class AppEnvironmentVariables {
	@IsEnum(NodeEnv)
	readonly NODE_ENV: NodeEnv = NodeEnv.DEV;

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
	readonly DEFAULT_AVATAR_PATH: string;
}

interface IApp {
	env: NodeEnv;
	port: number;
	url: string;
	clientUrl: string;
	defaults: {
		avatar: string;
	};
}

export const appConfig = registerAs<IApp>('app', () => {
	const env = validate(process.env, AppEnvironmentVariables);
	return {
		env: env.NODE_ENV,
		port: env.PORT,
		url: env.APP_URL,
		clientUrl: env.CLIENT_URL,
		defaults: {
			avatar: env.DEFAULT_AVATAR_PATH,
		},
	};
});

export type AppConfig = typeof appConfig;

export function validate<T extends object>(
	config: Record<string, unknown>,
	cls: ClassConstructor<T>
) {
	const validatedConfig = plainToInstance(cls, config, {
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
