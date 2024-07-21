import { describe, expect, it } from 'vitest';
import { generate, makeKey } from './slug';

describe('generate', () => {
  it('should generate slug from filename', () => {
    expect(generate('my-first-post.md')).toBe('my-first-post');
  });

  it('should handle index file', () => {
    expect(generate('index.md')).toBe('');
  });

  it('should handle nested directory', () => {
    expect(generate('en/posts/my-first-post.md')).toEqual('en/posts/my-first-post');
  });

  it('should handle nested directory with index file', () => {
    expect(generate('en/docs/index.md')).toBe('en/docs');
  });
});

describe('makeKey', () => {
  it('should generate key for global scope', () => {
    expect(makeKey({ by: 'global', type: '', value: 'my-slug' })).toBe('schemas:slug:global:my-slug');
  });

  it('should generate key for definition scope', () => {
    expect(makeKey({ by: 'definition', type: 'post', value: 'my-slug' })).toBe('schemas:slug:post:my-slug');
  });

  it('should throw error for unknown value of by', () => {
    expect(() => makeKey({ by: 'unknown' as 'global' | 'definition', type: '', value: 'my-slug' })).toThrowError(
      "Unknown value for 'by': unknown",
    );
  });
});
