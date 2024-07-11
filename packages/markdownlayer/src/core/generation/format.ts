import { extname } from 'node:path';

import type { DocumentFormat, DocumentFormatInput } from '../types';

// Copied from https://mdxjs.com/packages/mdx/#optionsmdextensions
// Although we are likely to only use .md / .mdx anyway...
const mdExtensions = [
  '.md',

  // others
  '.markdown',
  '.mdown',
  '.mkdn',
  '.mkd',
  '.mdwn',
  '.mkdown',
  '.ron',
];

export function getFormat({ file, format }: { file: string; format: DocumentFormatInput }): DocumentFormat {
  if (format === 'detect') {
    const ext = extname(file);
    if (mdExtensions.includes(ext)) return 'md';
    else if (ext === '.mdx') return 'mdx';
    else if (ext === '.mdoc') return 'mdoc';
    else throw new Error(`Unable to detect format for file: ${file}`);
  }

  return format;
}
