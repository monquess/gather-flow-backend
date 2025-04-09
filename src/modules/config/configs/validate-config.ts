import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const validateConfig = async <T extends object>(
	config: Record<string, unknown>,
	cls: ClassConstructor<T>
) => {
	const validatedConfig = plainToInstance(cls, config, {
		enableImplicitConversion: true,
	});
	const errors = await validate(validatedConfig, {
		skipMissingProperties: false,
	});

	if (errors.length > 0) {
		throw new Error(errors.toString());
	}

	return validatedConfig;
};
