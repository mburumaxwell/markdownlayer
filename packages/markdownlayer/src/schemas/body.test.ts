import { describe, expect, it } from 'vitest';
import { getFormat } from './body';

describe('getFormat', () => {
  it('should return "md" when format is "detect" and file has .md extension', () => {
    const result = getFormat({ file: 'example.md', format: 'detect' });
    expect(result).toBe('md');
  });

  it('should return "mdx" when format is "detect" and file has .mdx extension', () => {
    const result = getFormat({ file: 'example.mdx', format: 'detect' });
    expect(result).toBe('mdx');
  });

  it('should return "mdoc" when format is "detect" and file has .mdoc extension', () => {
    const result = getFormat({ file: 'example.mdoc', format: 'detect' });
    expect(result).toBe('mdoc');
  });

  it('should throw an error when format is "detect" and file has unknown extension', () => {
    expect(() => {
      getFormat({ file: 'example.txt', format: 'detect' });
    }).toThrowError('Unable to detect format for file: example.txt');
  });

  it('should return the provided format when format is not "detect"', () => {
    const result = getFormat({ file: 'example.md', format: 'mdx' });
    expect(result).toBe('mdx');
  });

  it('should work with full path', () => {
    const result = getFormat({
      file: '/Users/mike/Documents/markdownlayer/examples/starter/src/content/posts/example.md',
      format: 'detect',
    });
    expect(result).toBe('md');
  });
});
