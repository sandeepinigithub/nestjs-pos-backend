import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ValidationUtil } from '../utils/validation.util';
import { REGEX_PATTERNS } from '../constants/regex.constants';

@ValidatorConstraint({ async: false })
export class IsValidEmailConstraint implements ValidatorConstraintInterface {
  validate(email: any, args: ValidationArguments) {
    return typeof email === 'string' && ValidationUtil.isValidEmail(email);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Email must be a valid email address';
  }
}

export function IsValidEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidEmailConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
export class IsValidPhoneConstraint implements ValidatorConstraintInterface {
  validate(phone: any, args: ValidationArguments) {
    return typeof phone === 'string' && ValidationUtil.isValidPhone(phone);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Phone must be a valid phone number';
  }
}

export function IsValidPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPhoneConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
export class IsValidUsernameConstraint implements ValidatorConstraintInterface {
  validate(username: any, args: ValidationArguments) {
    return typeof username === 'string' && ValidationUtil.isValidUsername(username);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Username must be 3-30 characters and contain only letters, numbers, and underscores';
  }
}

export function IsValidUsername(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidUsernameConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
export class IsValidPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: any, args: ValidationArguments) {
    return typeof password === 'string' && ValidationUtil.isValidPassword(password);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must be at least 8 characters and contain uppercase, lowercase, and number';
  }
}

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPasswordConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
export class IsNotBlankConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return ValidationUtil.isNotEmpty(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Field cannot be empty';
  }
}

export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotBlankConstraint,
    });
  };
}

