import { normalize, relative } from 'node:path';
import { string } from 'zod';
import type { ResolvedConfig } from '../types';

export type IdOptions = {
  /**
   * Whether to use the default value.
   * @default true
   */
  default?: boolean;
};

type CompleteOptions = IdOptions & {
  type: string;
  path: string;
  config: ResolvedConfig;
};

/**
 * Schema for a document's id.
 * @returns A Zod object representing a document's id.
 */
export function id({
  default: useDefault = true,
  type,
  path,
  config: {
    contentDirPath,
    cache: { uniques },
  },
}: CompleteOptions) {
  const common = string().min(1);
  const base = useDefault ? common.default(normalize(relative(contentDirPath, path))) : common;

  return base.superRefine((value, { addIssue }) => {
    const key = `schemas:id:${type}:${value}`;
    if (uniques[key]) {
      addIssue({ fatal: true, code: 'custom', message: `duplicate id '${value}' in '${path}` });
    } else {
      uniques[key] = path;
    }
  });
}
