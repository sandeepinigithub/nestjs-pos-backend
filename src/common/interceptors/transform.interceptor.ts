import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    return next.handle().pipe(
      map((data) => {
        // Extract message from data if it exists, otherwise use default
        const message = data?.message || this.getDefaultMessage(request.method);
        
        // Remove message from data if it exists to avoid duplication
        let cleanData = data;
        if (data && typeof data === 'object' && 'message' in data) {
          const { message: _, ...rest } = data as any;
          cleanData = Object.keys(rest).length > 0 ? rest : data;
        }

        return new ApiResponseDto({
          success: true,
          statusCode: response.statusCode || 200,
          message,
          data: cleanData,
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id || request.headers['x-request-id'],
        });
      }),
    );
  }

  private getDefaultMessage(method: string): string {
    const messages: Record<string, string> = {
      GET: 'Data retrieved successfully',
      POST: 'Resource created successfully',
      PATCH: 'Resource updated successfully',
      PUT: 'Resource updated successfully',
      DELETE: 'Resource deleted successfully',
    };
    return messages[method] || 'Operation completed successfully';
  }
}

