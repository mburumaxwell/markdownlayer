import { expect, test } from 'vitest';
import { generate, makeKey } from './slug';

test('generate', () => {
  expect(generate('my-first-post.md')).toBe('my-first-post');

  // with index
  expect(generate('index.md')).toBe('');

  // nested directory
  expect(generate('en/posts/my-first-post.md')).toEqual('en/posts/my-first-post');

  // nested directory with index
  expect(generate('en/docs/index.md')).toBe('en/docs');
});

test('makeKey', () => {
  // Test case for 'by' = 'global'
  expect(makeKey({ by: 'global', type: '', value: 'my-slug' })).toBe('schemas:slug:global:my-slug');

  // Test case for 'by' = 'definition'
  expect(makeKey({ by: 'definition', type: 'post', value: 'my-slug' })).toBe('schemas:slug:post:my-slug');

  // Test case for unknown value of 'by'
  expect(() => makeKey({ by: 'unknown' as 'global' | 'definition', type: '', value: 'my-slug' })).toThrowError(
    "Unknown value for 'by': unknown",
  );
});
