/**
 * Formatting utility functions
 */

export class FormatUtil {
  /**
   * Format currency
   */
  static currency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  }

  /**
   * Format number
   */
  static number(value: number, locale: string = 'en-US', decimals: number = 2): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Format percentage
   */
  static percentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Format file size
   */
  static fileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format date
   */
  static date(date: Date | string | number, format: string = 'YYYY-MM-DD'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Format phone number
   */
  static phone(phone: string, format: string = 'XXX-XXX-XXXX'): string {
    const cleaned = phone.replace(/\D/g, '');
    let formatted = format;
    let index = 0;

    for (let i = 0; i < formatted.length && index < cleaned.length; i++) {
      if (formatted[i] === 'X') {
        formatted = formatted.substring(0, i) + cleaned[index] + formatted.substring(i + 1);
        index++;
      }
    }

    return formatted;
  }

  /**
   * Format name (First Last)
   */
  static name(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`.trim();
  }

  /**
   * Format full name
   */
  static fullName(firstName: string, lastName: string, middleName?: string): string {
    const parts = [firstName, middleName, lastName].filter(Boolean);
    return parts.join(' ');
  }

  /**
   * Format address
   */
  static address(
    street: string,
    city: string,
    state?: string,
    postalCode?: string,
    country?: string,
  ): string {
    const parts = [street, city, state, postalCode, country].filter(Boolean);
    return parts.join(', ');
  }
}

