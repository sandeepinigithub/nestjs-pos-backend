/**
 * Application-wide constants
 */

export const APP_CONSTANTS = {
  // Application Info
  APP_NAME: 'Enterprise POS System',
  APP_VERSION: '1.0.0',
  API_PREFIX: 'api',
  
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_PAGE: 1,
  
  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 100,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MAX_EMAIL_LENGTH: 255,
  MAX_NAME_LENGTH: 100,
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // Cache
  CACHE_TTL: 3600, // 1 hour in seconds
  CACHE_PREFIX: 'pos:',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // JWT
  JWT_EXPIRES_IN: '7d',
  JWT_REFRESH_EXPIRES_IN: '30d',
  
  // Password
  BCRYPT_ROUNDS: 10,
  
  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  DATABASE_TIMEOUT: 10000, // 10 seconds
  
  // Order
  ORDER_NUMBER_PREFIX: 'ORD',
  ORDER_NUMBER_LENGTH: 6,
  
  // Customer
  CUSTOMER_NUMBER_PREFIX: 'CUST',
  CUSTOMER_NUMBER_LENGTH: 6,
} as const;

