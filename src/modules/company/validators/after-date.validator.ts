import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { CreateEventDto } from '../../company/dto/create-event.dto';

@ValidatorConstraint({ async: false })
export class AfterDateValidator implements ValidatorConstraintInterface {
	validate(date: string | undefined, args: ValidationArguments) {
		const object = args.object as CreateEventDto;
		const startDate = object.startDate;

		if (!startDate || !date) return true;

		return new Date(date) > new Date(startDate);
	}

	defaultMessage(args: ValidationArguments) {
		return `${args.property} must be later than start date`;
	}
}
