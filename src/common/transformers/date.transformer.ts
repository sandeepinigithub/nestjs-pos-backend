import { Transform } from 'class-transformer';
import { DateUtil } from '../utils/date.util';

/**
 * Transform string to Date
 */
export function ToDate() {
  return Transform(({ value }) => {
    if (!value) return value;
    return new Date(value);
  });
}

/**
 * Transform Date to ISO string
 */
export function ToISOString() {
  return Transform(({ value }) => {
    if (!value) return value;
    return DateUtil.toISOString(value);
  });
}

/**
 * Transform Date to date string (YYYY-MM-DD)
 */
export function ToDateString() {
  return Transform(({ value }) => {
    if (!value) return value;
    return DateUtil.toDateString(value);
  });
}

