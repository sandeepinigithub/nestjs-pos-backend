import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/error.constants';

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraints?: Record<string, string>;
}

export class ValidationException extends HttpException {
  public readonly errors: ValidationError[];

  constructor(errors: ValidationError[] | string) {
    const errorArray = Array.isArray(errors)
      ? errors
      : [{ field: 'general', message: errors }];

    super(
      {
        message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED],
        errorCode: ERROR_CODES.VALIDATION_FAILED,
        statusCode: HttpStatus.BAD_REQUEST,
        errors: errorArray,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );

    this.errors = errorArray;
  }
}

export class InvalidEmailException extends ValidationException {
  constructor(field: string = 'email') {
    super([
      {
        field,
        message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_INVALID_EMAIL],
      },
    ]);
  }
}

export class InvalidPhoneException extends ValidationException {
  constructor(field: string = 'phone') {
    super([
      {
        field,
        message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_INVALID_PHONE],
      },
    ]);
  }
}

export class InvalidPasswordException extends ValidationException {
  constructor(field: string = 'password') {
    super([
      {
        field,
        message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_INVALID_PASSWORD],
      },
    ]);
  }
}

