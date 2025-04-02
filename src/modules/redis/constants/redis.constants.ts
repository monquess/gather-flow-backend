export const REDIS_OPTIONS = 'REDIS_OPTIONS';

export const RedisPrefix = {
	VERIFICATION_TOKEN: 'verification',
	RESET_TOKEN: 'reset',
	REFRESH_TOKEN: 'refresh',
} as const;

export type RedisPrefix = (typeof RedisPrefix)[keyof typeof RedisPrefix];
