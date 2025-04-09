import { registerAs } from '@nestjs/config';
import { validate } from './app.config';
import { IsBoolean, IsNumber, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

class MailEnvironmentVariables {
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
}

interface IMail {
	host: string;
	port: number;
	auth: {
		user: string;
		pass: string;
	};
	from: {
		name: string;
		address: string;
	};
}

export const mailConfig = registerAs<IMail>('mail', () => {
	const env = validate(process.env, MailEnvironmentVariables);
	return {
		host: env.MAIL_HOST,
		port: env.MAIL_PORT,
		auth: {
			user: env.MAIL_USERNAME,
			pass: env.MAIL_PASSWORD,
		},
		from: {
			name: env.MAIL_FROM_NAME,
			address: env.MAIL_FROM_ADDRESS,
		},
	};
});

export type MailConfig = typeof mailConfig;
