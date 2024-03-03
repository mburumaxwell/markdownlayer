export const FORMATS_DATE: string = 'dd MMM yyyy';
export const FORMATS_DATE_LONG: string = 'MMMM dd, yyyy';
export const FORMATS_DATE_TIME: string = 'dd MMM yyyy HH:mm a';
export const FORMATS_DATE_TIME_ISO: string = "yyyy-MM-dd'T'HH:mm:ss";

import { isDate, parseISO } from 'date-fns';
import { format } from 'date-fns/format';

/**
 * @description
 * Try and parse a given value to a valid date object.
 * If the value is an invalid date time representation, expect a null result
 *
 * @param date - the value to be parsed to a valid date object
 *
 * @returns {Date | null} the valid date object
 */
export function tryParseDate(date: Date | string | null | undefined): Date | null {
  // check if value defined
  if (!!!date) {
    return null;
  }
  // check if value is a valid date.
  // if the date value is valid, return
  if (isDate(date)) {
    return date as Date;
  }

  // try parse the value
  try {
    return parseISO(date as string);
  } catch (e) {
    return null;
  }
}

/**
 * @description
 * Format a date object or its string representation to a desired format
 *
 * @param {Date | String } date - the date object/string to be formatted
 * @param {String} dateFormat - the date format required
 *
 * @returns {string | null} the formatted date string
 */
export function formatDate(date: string | Date, dateFormat: string = FORMATS_DATE_TIME): string | null {
  // check if a value and the date format required has been provided
  if (!!!date || !!!dateFormat) {
    return null;
  }

  // try parse the date value to a date object
  let validDate: Date | null = tryParseDate(date);

  if (!!!validDate) {
    return null;
  }

  return format(validDate, dateFormat);
}
