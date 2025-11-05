/**
 * Standard Enterprise API Response Format
 * Used for both success and error responses
 */
export class ApiResponseDto<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T | null;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  timestamp?: string;
  path?: string;
  requestId?: string;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    this.success = partial.success ?? false;
    this.statusCode = partial.statusCode ?? 200;
    this.message = partial.message ?? '';
    this.data = partial.data ?? null;
    this.errors = partial.errors;
    this.timestamp = partial.timestamp ?? new Date().toISOString();
    this.path = partial.path;
    this.requestId = partial.requestId;
  }
}

