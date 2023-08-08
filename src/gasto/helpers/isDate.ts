import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import * as moment from 'moment';

@ValidatorConstraint({ name: 'isDateString', async: false })
export class IsDateStringConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return moment(text, moment.ISO_8601, true).isValid();
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} debe ser una fecha válida en formato ISO8601.`;
  }
}