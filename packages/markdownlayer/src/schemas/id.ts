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
  config: {
    cache: { uniques },
  },
}: {
  type: string;
  relativePath: string;
  path: string;
  config: ResolvedConfig;
}) {
  return string()
    .min(1)
    .default(normalize(relativePath))
    .superRefine((value, { addIssue }) => {
      const key = `schemas:id:${type}:${value}`;
      if (uniques[key]) {
        addIssue({ fatal: true, code: 'custom', message: `duplicate id '${value}' in '${path}` });
      } else {
        uniques[key] = path;
      }
    });
}
