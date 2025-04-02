import { UnprocessableEntityException, ValidationError } from '@nestjs/common';

export const validationExceptionFactory = (errors: ValidationError[]) => {
	const [error] = errors;
	const extractError = (
		error: ValidationError
	): { property: string; message: string } => {
		if (error.constraints) {
			const [message] = Object.values(error.constraints);
			return {
				property: error.property,
				message,
			};
		}
		return {
			property: error.property,
			message: 'Validation error',
		};
	};
	return new UnprocessableEntityException(extractError(error));
};
