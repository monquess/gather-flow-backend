import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';

import { validateConfig } from './validate-config';

class StripeEnvironmentVariables {
	@IsString()
	readonly STRIPE_PUBLIC_KEY: string;

	@IsString()
	readonly STRIPE_SECRET_KEY: string;

	@IsString()
	readonly STRIPE_WEBHOOK_KEY: string;

	@IsString()
	readonly STRIPE_CLIENT_ID: string;
}

interface IStripe {
	publicKey: string;
	secretKey: string;
	webhookKey: string;
	clientId: string;
}

export const stripeConfig = registerAs<IStripe>('stripe', async () => {
	const env = await validateConfig(StripeEnvironmentVariables);
	return {
		publicKey: env.STRIPE_PUBLIC_KEY,
		secretKey: env.STRIPE_SECRET_KEY,
		webhookKey: env.STRIPE_WEBHOOK_KEY,
		clientId: env.STRIPE_CLIENT_ID,
	};
});

export type StripeConfig = typeof stripeConfig;
