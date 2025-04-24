import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class FutureDateValidator implements ValidatorConstraintInterface {
	validate(value: string, _args: ValidationArguments) {
		const date = new Date(value);
		const now = new Date();

		return date > now;
	}

	defaultMessage(_args: ValidationArguments) {
		return `Time must be a future date and time.`;
	}
}
