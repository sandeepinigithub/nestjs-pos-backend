/**
 * API-related types
 */

import { Request } from 'express';

export interface ApiRequest extends Request {
  id?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface ApiValidationError extends ApiError {
  field: string;
  value?: any;
  constraints?: Record<string, string>;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: ApiError[];
  timestamp: string;
  path: string;
  requestId?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface SwaggerApiResponse {
  description: string;
  status: number;
  schema?: any;
  example?: any;
}

