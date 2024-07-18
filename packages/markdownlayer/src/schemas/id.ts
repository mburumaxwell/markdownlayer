import { normalize } from 'node:path';
import { string } from 'zod';
import type { ResolvedConfig } from '../types';

/**
 * Schema for a document's id.
 * @returns A Zod object representing a document's id.
 */
export function id({
  type,
  relativePath,
  path,
  cache: { uniques: cache },
}: { type: string; relativePath: string; path: string } & Pick<ResolvedConfig, 'cache'>) {
  return string()
    .min(1)
    .default(normalize(relativePath))
    .superRefine((value, { addIssue }) => {
      const key = `schemas:ids:${type}:${value}`;
      if (cache[key]) {
        addIssue({ fatal: true, code: 'custom', message: `duplicate id '${value}' in '${path}` });
      } else {
        cache[key] = path;
      }
    });
}
