import { NodeEnv } from '@common/enum/node-env.enum';
import { EnvironmentGuard } from '@common/guards/environment.guard';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

export const ENV_KEY = 'env';

export const Environment = (...env: NodeEnv[]) => {
	return applyDecorators(SetMetadata(ENV_KEY, env), UseGuards(EnvironmentGuard));
};
