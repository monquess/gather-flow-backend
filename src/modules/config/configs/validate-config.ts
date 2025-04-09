import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const validateConfig = async <T extends object>(
	cls: ClassConstructor<T>,
	config: Record<string, unknown> = process.env
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
