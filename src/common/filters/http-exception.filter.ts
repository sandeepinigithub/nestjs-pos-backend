import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Extract message and errors from exception response
    let message = 'An error occurred';
    let errors: Array<{ field?: string; message: string }> | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const errorObj = exceptionResponse as any;
      message = errorObj.message || errorObj.error || 'An error occurred';
      
      // Handle validation errors
      if (Array.isArray(errorObj.message)) {
        errors = errorObj.message.map((msg: string) => ({
          message: msg,
        }));
        message = 'Validation failed';
      } else if (errorObj.errors && Array.isArray(errorObj.errors)) {
        errors = errorObj.errors;
        message = errorObj.message || 'Validation failed';
      } else if (errorObj.message && typeof errorObj.message === 'object') {
        // Handle class-validator errors format
        const validationErrors = errorObj.message;
        errors = Object.keys(validationErrors).map((field) => ({
          field,
          message: Array.isArray(validationErrors[field])
            ? validationErrors[field].join(', ')
            : String(validationErrors[field]),
        }));
        message = 'Validation failed';
      }
    }

    const apiResponse = new ApiResponseDto({
      success: false,
      statusCode: status,
      message,
      data: null,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: (request as any).id || request.headers['x-request-id'],
    });

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${JSON.stringify(apiResponse)}`);
    }

    response.status(status).json(apiResponse);
  }
}

