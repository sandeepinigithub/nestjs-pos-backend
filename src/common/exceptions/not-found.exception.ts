import { NotFoundException as NestNotFoundException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/error.constants';

export class NotFoundException extends NestNotFoundException {
  constructor(
    resource?: string,
    public readonly errorCode?: string,
    public readonly details?: any,
  ) {
    const message = resource
      ? `${resource} not found`
      : ERROR_MESSAGES[ERROR_CODES.NOT_FOUND];

    super({
      message,
      errorCode: errorCode || ERROR_CODES.NOT_FOUND,
      statusCode: HttpStatus.NOT_FOUND,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}

export class UserNotFoundException extends NotFoundException {
  constructor(details?: any) {
    super('User', ERROR_CODES.USER_NOT_FOUND, details);
  }
}

export class StoreNotFoundException extends NotFoundException {
  constructor(details?: any) {
    super('Store', ERROR_CODES.STORE_NOT_FOUND, details);
  }
}

export class ProductNotFoundException extends NotFoundException {
  constructor(details?: any) {
    super('Product', ERROR_CODES.PRODUCT_NOT_FOUND, details);
  }
}

export class OrderNotFoundException extends NotFoundException {
  constructor(details?: any) {
    super('Order', ERROR_CODES.ORDER_NOT_FOUND, details);
  }
}

export class PermissionNotFoundException extends NotFoundException {
  constructor(details?: any) {
    super('Permission', ERROR_CODES.PERMISSION_NOT_FOUND, details);
  }
}

