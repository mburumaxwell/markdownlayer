import { describe, expect, it } from 'vitest';
import { MarkdownlayerCache } from '../cache';
import type { ResolvedConfig } from '../types';
import { generate, makeKey, slug } from './slug';

const mockConfig: ResolvedConfig = {
  mode: 'development',
  configPath: '/Users/mike/Documents/markdownlayer/examples/starter/markdownlayer.config.ts',
  configHash: '1234567890',
  configImports: [],
  patterns: '**/*.{md,mdx,mdoc}',
  output: {
    generated: '/Users/mike/Documents/markdownlayer/examples/starter/.markdownlayer/generated',
    assets: '/Users/mike/Documents/markdownlayer/examples/starter/public/static',
    base: '/static/',
    format: '[name]-[hash].[ext]',
  },
  contentDirPath: '/Users/mike/Documents/markdownlayer/examples/starter/src/content',
  definitions: {},
  cache: new MarkdownlayerCache(null),
};

describe('slug', () => {
  it('should use default value when useDefault is true', () => {
    const schema = slug({
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
      default: true,
    });

    const result = schema.parse(undefined);
    expect(result).toBe('test');
  });

  it('should not use default value when useDefault is false', () => {
    const schema = slug({
      default: false,
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });

    expect(() => schema.parse(undefined)).toThrow();
  });

  it('should enforce minimum length', () => {
    const schema = slug({
      min: 3,
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });

    expect(() => schema.parse('12')).toThrow();
    expect(() => schema.parse('123')).not.toThrow();
  });

  it('should enforce minimum length when min is set to 0', () => {
    const schema = slug({
      min: 0,
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });

    expect(() => schema.parse('')).not.toThrow();
  });

  it('should throw error for an invalid slug format', () => {
    const schema = slug({
      reserved: ['reserved-slug'],
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });
    expect(() => schema.parse('Invalid Slug!')).toThrow('Invalid slug');
  });

  it('should throw error for a reserved slug', () => {
    const schema = slug({
      reserved: ['reserved-slug'],
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });

    expect(() => schema.parse('reserved-slug')).toThrow('Reserved slug');
  });

  it('should throw error for duplicate slug', () => {
    const schema = slug({
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });

    schema.parse('unique-slug');
    expect(() => schema.parse('unique-slug')).toThrow(/duplicate slug 'unique-slug' in 'test\/test.md'/);
  });

  it('should add slug to cache when schema works', () => {
    const schema = slug({
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });

    const result = schema.parse('new-unique-slug');
    expect(result).toBe('new-unique-slug');
    expect(mockConfig.cache.uniques['schemas:slug:test:new-unique-slug']).toBe(
      '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
    );
  });
});

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
