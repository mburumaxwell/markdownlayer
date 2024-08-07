import { join, normalize, relative } from 'node:path';
import { string } from 'zod';
import type { ResolvedMarkdownlayerConfig } from '../types';

export type IdOptions = {
  /**
   * Minimum length of the id.
   * @default 1
   */
  min?: number;

  /**
   * Whether to use the default value.
   * @default true
   */
  default?: boolean;
};

type CompleteOptions = IdOptions & {
  type: string;
  path: string;
  config: ResolvedMarkdownlayerConfig;
};

/**
 * Schema for a document's id.
 * @returns A Zod object representing a document's id.
 */
export function id({
  min = 1,
  default: useDefault = true,
  type,
  path,
  config: {
    contentDirPath,
    cache: { uniques },
  },
}: CompleteOptions) {
  const common = string().min(min);
  const base = useDefault ? common.default(normalize(relative(join(contentDirPath, type), path))) : common;

  return base.superRefine((value, { addIssue }) => {
    const key = `schemas:id:${type}:${value}`;
    if (uniques[key]) {
      addIssue({
        fatal: true,
        code: 'custom',
        message: `duplicate id '${value}' in '${relative(contentDirPath, path)}'`,
      });
    } else {
      uniques[key] = path;
    }
  });
}
