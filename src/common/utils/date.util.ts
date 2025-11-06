/**
 * Date utility functions
 */

export class DateUtil {
  /**
   * Format date to ISO string
   */
  static toISOString(date: Date | string | number): string {
    const d = new Date(date);
    return d.toISOString();
  }

  /**
   * Format date to YYYY-MM-DD
   */
  static toDateString(date: Date | string | number): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  /**
   * Format date to readable string
   */
  static toReadableString(date: Date | string | number, locale: string = 'en-US'): string {
    const d = new Date(date);
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Check if date is valid
   */
  static isValid(date: any): boolean {
    if (!date) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
  }

  /**
   * Get current timestamp
   */
  static now(): Date {
    return new Date();
  }

  /**
   * Get current timestamp in milliseconds
   */
  static nowMs(): number {
    return Date.now();
  }

  /**
   * Add days to date
   */
  static addDays(date: Date | string | number, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  /**
   * Add hours to date
   */
  static addHours(date: Date | string | number, hours: number): Date {
    const d = new Date(date);
    d.setHours(d.getHours() + hours);
    return d;
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date | string | number): boolean {
    return new Date(date) < new Date();
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date | string | number): boolean {
    return new Date(date) > new Date();
  }

  /**
   * Get difference in days between two dates
   */
  static diffInDays(date1: Date | string | number, date2: Date | string | number): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

