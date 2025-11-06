/**
 * Database-related types
 */

export interface PrismaWhereInput {
  [key: string]: any;
}

export interface PrismaOrderByInput {
  [key: string]: 'asc' | 'desc';
}

export interface PrismaSelectInput {
  [key: string]: boolean;
}

export interface PrismaIncludeInput {
  [key: string]: boolean | PrismaIncludeInput;
}

export interface PrismaPaginationInput {
  skip: number;
  take: number;
}

export interface PrismaQueryInput {
  where?: PrismaWhereInput;
  orderBy?: PrismaOrderByInput | PrismaOrderByInput[];
  select?: PrismaSelectInput;
  include?: PrismaIncludeInput;
  skip?: number;
  take?: number;
}

export interface DatabaseTransaction {
  [key: string]: any;
}

export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export interface QueryResult<T = any> {
  data: T[];
  count: number;
  total?: number;
}

