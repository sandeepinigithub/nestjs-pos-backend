/**
 * Regular expression patterns
 */

export const REGEX_PATTERNS = {
  // Email validation
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Phone number (international format)
  PHONE: /^\+?[1-9]\d{1,14}$/,
  
  // Username (alphanumeric + underscore, 3-30 chars)
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  
  // Password (min 8 chars, at least one uppercase, lowercase, and number)
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  
  // Strong password (min 8 chars, uppercase, lowercase, number, special char)
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Store code (alphanumeric + underscore/hyphen, 2-50 chars)
  STORE_CODE: /^[a-zA-Z0-9_-]{2,50}$/,
  
  // Product code (alphanumeric + underscore/hyphen, 2-50 chars)
  PRODUCT_CODE: /^[a-zA-Z0-9_-]{2,50}$/,
  
  // Order number format (ORD-YYYYMMDD-XXXXXX)
  ORDER_NUMBER: /^ORD-\d{8}-\d{6}$/,
  
  // Customer number format (CUST-YYYYMMDD-XXXXXX)
  CUSTOMER_NUMBER: /^CUST-\d{8}-\d{6}$/,
  
  // UUID format
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  
  // ISO Date format (YYYY-MM-DD)
  ISO_DATE: /^\d{4}-\d{2}-\d{2}$/,
  
  // ISO DateTime format
  ISO_DATETIME: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  
  // Currency format (supports decimal)
  CURRENCY: /^\d+(\.\d{1,2})?$/,
  
  // Positive integer
  POSITIVE_INTEGER: /^[1-9]\d*$/,
  
  // Non-negative integer
  NON_NEGATIVE_INTEGER: /^\d+$/,
  
  // URL validation
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

