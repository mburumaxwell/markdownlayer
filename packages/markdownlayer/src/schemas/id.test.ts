import { describe, expect, it } from 'vitest';
import { MarkdownlayerCache } from '../cache';
import type { ResolvedConfig } from '../types';
import { id } from './id';

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

describe('id', () => {
  it('should use default value when default is true', () => {
    const schema = id({
      default: true,
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });

    const result = schema.parse(undefined);
    expect(result).toBe('test/test.md');
  });

  it('should not use default value when default is false', () => {
    const schema = id({
      default: false,
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });

    expect(() => schema.parse(undefined)).toThrow();
    expect(schema.parse('some-value')).toBe('some-value');
  });

  it('should enforce minimum length', () => {
    const schema = id({
      min: 5,
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });

    expect(() => schema.parse('1234')).toThrow();
    expect(() => schema.parse('12345')).not.toThrow();
  });

  it('should throw error for duplicate id', () => {
    const schema = id({
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });

    schema.parse('unique-id');
    expect(() => schema.parse('unique-id')).toThrow(/duplicate id 'unique-id' in 'test\/test.md'/);
  });

  it('should add id to cache when schema works', () => {
    const schema = id({
      type: 'test',
      path: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
      config: mockConfig,
    });

    const result = schema.parse('new-unique-id');
    expect(result).toBe('new-unique-id');
    expect(mockConfig.cache.uniques['schemas:id:test:new-unique-id']).toBe(
      '/Users/mike/Documents/markdownlayer/examples/starter/src/content/test/test.md',
    );
  });
});
