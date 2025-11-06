import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/error.constants';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly errorCode?: string,
    public readonly details?: any,
  ) {
    super(
      {
        message,
        errorCode: errorCode || ERROR_CODES.BAD_REQUEST,
        statusCode,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

export class ConflictException extends BusinessException {
  constructor(message?: string, errorCode?: string, details?: any) {
    super(
      message || ERROR_MESSAGES[ERROR_CODES.CONFLICT],
      HttpStatus.CONFLICT,
      errorCode || ERROR_CODES.CONFLICT,
      details,
    );
  }
}

export class UnprocessableEntityException extends BusinessException {
  constructor(message?: string, errorCode?: string, details?: any) {
    super(
      message || ERROR_MESSAGES[ERROR_CODES.UNPROCESSABLE_ENTITY],
      HttpStatus.UNPROCESSABLE_ENTITY,
      errorCode || ERROR_CODES.UNPROCESSABLE_ENTITY,
      details,
    );
  }
}

