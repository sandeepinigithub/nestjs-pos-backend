/**
 * String utility functions
 */

export class StringUtil {
  /**
   * Generate random string
   */
  static random(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random alphanumeric string
   */
  static randomAlphanumeric(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random numeric string
   */
  static randomNumeric(length: number = 10): string {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Slugify string
   */
  static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Capitalize first letter
   */
  static capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Capitalize each word
   */
  static capitalizeWords(text: string): string {
    if (!text) return text;
    return text.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  /**
   * Truncate string
   */
  static truncate(text: string, length: number, suffix: string = '...'): string {
    if (!text || text.length <= length) return text;
    return text.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Remove HTML tags
   */
  static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Mask email
   */
  static maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    const maskedName = name.substring(0, 2) + '***' + name.substring(name.length - 1);
    return `${maskedName}@${domain}`;
  }

  /**
   * Mask phone
   */
  static maskPhone(phone: string): string {
    if (phone.length <= 4) return phone;
    return phone.substring(0, 2) + '***' + phone.substring(phone.length - 2);
  }

  /**
   * Pad string
   */
  static pad(str: string, length: number, padChar: string = '0'): string {
    return str.padStart(length, padChar);
  }

  /**
   * Generate order number
   */
  static generateOrderNumber(prefix: string = 'ORD', sequence: number): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const seqStr = String(sequence).padStart(6, '0');
    return `${prefix}-${dateStr}-${seqStr}`;
  }

  /**
   * Generate customer number
   */
  static generateCustomerNumber(prefix: string = 'CUST', sequence: number): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const seqStr = String(sequence).padStart(6, '0');
    return `${prefix}-${dateStr}-${seqStr}`;
  }
}

