import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class FutureDateValidator implements ValidatorConstraintInterface {
	validate(date: string | undefined, _args: ValidationArguments) {
		if (!date) {
			return true;
		}

		return new Date(date) > new Date();
	}

	defaultMessage(args: ValidationArguments) {
		return `${args.property} must be later than ${new Date().toISOString()}`;
	}
}
