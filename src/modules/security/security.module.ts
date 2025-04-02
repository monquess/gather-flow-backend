import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import * as cors from 'cors';
import helmet from 'helmet';

import { corsOptions, helmetOptions } from './options';

@Module({})
export class SecurityModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(cors(corsOptions)).forRoutes('*path');
		consumer.apply(helmet(helmetOptions)).forRoutes('*path');
	}
}
