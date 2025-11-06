import { ForbiddenException as NestForbiddenException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/error.constants';

export class ForbiddenException extends NestForbiddenException {
  constructor(
    message?: string,
    public readonly errorCode?: string,
    public readonly details?: any,
  ) {
    super({
      message: message || ERROR_MESSAGES[ERROR_CODES.AUTH_FORBIDDEN],
      errorCode: errorCode || ERROR_CODES.AUTH_FORBIDDEN,
      statusCode: HttpStatus.FORBIDDEN,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}

export class PermissionDeniedException extends ForbiddenException {
  constructor(message?: string, details?: any) {
    super(
      message || ERROR_MESSAGES[ERROR_CODES.PERMISSION_DENIED],
      ERROR_CODES.PERMISSION_DENIED,
      details,
    );
  }
}

export class InsufficientPermissionsException extends ForbiddenException {
  constructor(message?: string, details?: any) {
    super(
      message || ERROR_MESSAGES[ERROR_CODES.PERMISSION_INSUFFICIENT],
      ERROR_CODES.PERMISSION_INSUFFICIENT,
      details,
    );
  }
}

