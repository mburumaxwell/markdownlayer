import { describe, expect, it } from 'vitest';
import { toc } from './toc';

describe('toc', () => {
  it('should generate a table of contents from markdown content', async () => {
    const contents = `
# Header 1
## Header 2
### Header 3
`;

    const result = await toc({ contents }).parseAsync({});
    expect(result).toEqual([
      { level: 1, value: 'Header 1', id: 'header-1', url: '#header-1' },
      { level: 2, value: 'Header 2', id: 'header-2', url: '#header-2' },
      { level: 3, value: 'Header 3', id: 'header-3', url: '#header-3' },
    ]);
  });

  it('should handle markdown content with no headers', async () => {
    const contents = `
This is a paragraph.
Another paragraph.
`;

    const result = await toc({ contents }).parseAsync({});
    expect(result).toEqual([]);
  });

  it('should handle markdown content with mixed content', async () => {
    const contents = `
# Header 1
This is a paragraph.
## Header 2
Another paragraph.
### Header 3
`;

    const result = await toc({ contents }).parseAsync({});
    expect(result).toEqual([
      { level: 1, value: 'Header 1', id: 'header-1', url: '#header-1' },
      { level: 2, value: 'Header 2', id: 'header-2', url: '#header-2' },
      { level: 3, value: 'Header 3', id: 'header-3', url: '#header-3' },
    ]);
  });

  it('should handle markdown content with special characters in headers', async () => {
    const contents = `
# Header 1!
## Header 2@
### Header 3#
`;

    const result = await toc({ contents }).parseAsync({});
    expect(result).toEqual([
      { level: 1, value: 'Header 1!', id: 'header-1', url: '#header-1' },
      { level: 2, value: 'Header 2@', id: 'header-2', url: '#header-2' },
      { level: 3, value: 'Header 3#', id: 'header-3', url: '#header-3' },
    ]);
  });
});
