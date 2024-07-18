import { expect, test } from 'vitest';

import { getFormat } from './body';

test('getFormat should return "md" when format is "detect" and file has .md extension', () => {
  const result = getFormat({ file: 'example.md', format: 'detect' });
  expect(result).toBe('md');
});

test('getFormat should return "mdx" when format is "detect" and file has .mdx extension', () => {
  const result = getFormat({ file: 'example.mdx', format: 'detect' });
  expect(result).toBe('mdx');
});

test('getFormat should return "mdoc" when format is "detect" and file has .mdoc extension', () => {
  const result = getFormat({ file: 'example.mdoc', format: 'detect' });
  expect(result).toBe('mdoc');
});

test('getFormat should throw an error when format is "detect" and file has unknown extension', () => {
  expect(() => {
    getFormat({ file: 'example.txt', format: 'detect' });
  }).toThrowError('Unable to detect format for file: example.txt');
});

test('getFormat should return the provided format when format is not "detect"', () => {
  const result = getFormat({ file: 'example.md', format: 'mdx' });
  expect(result).toBe('mdx');
});

test('getFormat works with full path', () => {
  const result = getFormat({
    file: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/posts/example.md',
    format: 'detect',
  });
  expect(result).toBe('md');
});
