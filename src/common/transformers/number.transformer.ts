import { Transform } from 'class-transformer';

/**
 * Transform string to number
 */
export function ToNumber() {
  return Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    const num = Number(value);
    return isNaN(num) ? value : num;
  });
}

/**
 * Transform string to integer
 */
export function ToInt() {
  return Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    const num = parseInt(value, 10);
    return isNaN(num) ? value : num;
  });
}

/**
 * Transform string to float
 */
export function ToFloat() {
  return Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  });
}

/**
 * Transform to boolean
 */
export function ToBoolean() {
  return Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
  });
}

