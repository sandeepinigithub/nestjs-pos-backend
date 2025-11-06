/**
 * Common TypeScript types
 */

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type NullableOptional<T> = T | null | undefined;

export type ID = string;

export type Timestamp = Date | string | number;

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors?: Array<{ field?: string; message: string }>;
  timestamp: string;
  path: string;
  requestId?: string;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
  timestamp: string;
  path: string;
  requestId?: string;
}

export interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  requestId?: string;
}

export type AsyncResult<T> = Promise<T>;
export type AsyncResultOrNull<T> = Promise<T | null>;
export type AsyncResultOrVoid<T> = Promise<T | void>;

export interface EntityWithDates {
  createdAt: Date;
  updatedAt: Date;
}

export interface EntityWithSoftDelete extends EntityWithDates {
  deletedAt?: Date | null;
}

export interface EntityWithAudit extends EntityWithDates {
  createdBy?: ID | null;
  updatedBy?: ID | null;
}

export interface FileUpload {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface JwtPayload {
  sub: ID;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RequestUser {
  id: ID;
  email: string;
  role: string;
  [key: string]: any;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
  id?: string; // Request ID
}

