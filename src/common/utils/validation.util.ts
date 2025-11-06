/**
 * Validation utility functions
 */

import { REGEX_PATTERNS } from '../constants/regex.constants';

export class ValidationUtil {
  /**
   * Validate email
   */
  static isValidEmail(email: string): boolean {
    return REGEX_PATTERNS.EMAIL.test(email);
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone: string): boolean {
    return REGEX_PATTERNS.PHONE.test(phone);
  }

  /**
   * Validate username
   */
  static isValidUsername(username: string): boolean {
    return REGEX_PATTERNS.USERNAME.test(username);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): boolean {
    return REGEX_PATTERNS.PASSWORD.test(password);
  }

  /**
   * Validate strong password
   */
  static isStrongPassword(password: string): boolean {
    return REGEX_PATTERNS.STRONG_PASSWORD.test(password);
  }

  /**
   * Validate UUID
   */
  static isValidUUID(uuid: string): boolean {
    return REGEX_PATTERNS.UUID.test(uuid);
  }

  /**
   * Validate URL
   */
  static isValidUrl(url: string): boolean {
    return REGEX_PATTERNS.URL.test(url);
  }

  /**
   * Validate positive integer
   */
  static isPositiveInteger(value: any): boolean {
    return REGEX_PATTERNS.POSITIVE_INTEGER.test(String(value));
  }

  /**
   * Validate non-negative integer
   */
  static isNonNegativeInteger(value: any): boolean {
    return REGEX_PATTERNS.NON_NEGATIVE_INTEGER.test(String(value));
  }

  /**
   * Validate currency
   */
  static isValidCurrency(value: any): boolean {
    return REGEX_PATTERNS.CURRENCY.test(String(value));
  }

  /**
   * Sanitize string (remove dangerous characters)
   */
  static sanitize(str: string): string {
    return str
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  /**
   * Check if value is empty
   */
  static isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  /**
   * Check if value is not empty
   */
  static isNotEmpty(value: any): boolean {
    return !this.isEmpty(value);
  }
}

