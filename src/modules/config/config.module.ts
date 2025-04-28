import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import * as factories from './factories';
import * as configs from './configs';

const providers = [...Object.values(factories)];
const load = [...Object.values(configs)];

@Global()
@Module({
	imports: [
		NestConfigModule.forRoot({
			cache: true,
			load,
		}),
	],
	providers,
	exports: [NestConfigModule, ...providers],
})
export class ConfigModule {}
