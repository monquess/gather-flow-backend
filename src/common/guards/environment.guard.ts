import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { Observable } from 'rxjs';

import { ENV_KEY } from '@common/decorators/environment.decorator';
import { NodeEnv } from '@common/enum/node-env.enum';
import { AppConfig, appConfig } from '@modules/config/configs';

@Injectable()
export class EnvironmentGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		@Inject(appConfig.KEY) private config: ConfigType<AppConfig>
	) {}

	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const env = this.reflector.getAllAndOverride<NodeEnv[]>(ENV_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!env) {
			return true;
		}

		return env.includes(this.config.env);
	}
}
