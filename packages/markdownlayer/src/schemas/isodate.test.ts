import { expect, test } from 'vitest';
import { isodate } from './isodate';

test('isodate', () => {
  // Valid ISO date string
  expect(isodate().parse('2022-01-01')).toBe('2022-01-01T00:00:00.000Z');

  // Invalid date string
  expect(() => isodate().parse('invalid-date')).toThrowError('Invalid date string');

  // Coerce option enabled
  expect(isodate({ coerce: true }).parse('2022-01-01')).toBe('2022-01-01T00:00:00.000Z');

  // Coerce option enabled with invalid date string
  expect(() => isodate({ coerce: true }).parse('invalid-date')).toThrowError('Invalid date string');
});
