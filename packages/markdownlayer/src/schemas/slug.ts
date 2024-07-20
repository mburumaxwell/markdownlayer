import { slug as githubSlug } from 'github-slugger';
import { extname, join, relative, sep as separator } from 'node:path';
import { string } from 'zod';
import type { ResolvedConfig } from '../types';

export type SlugParams = {
  /**
   * Unique by this, used to create a unique set of slugs
   * @default 'definition'
   */
  by?: 'definition' | 'global';

  /** Reserved slugs, will be rejected */
  reserved?: string[];
};

type CompleteOptions = SlugParams & {
  type: string;
  path: string;
  config: ResolvedConfig;
};

/**
 * Schema for a document's slug.
 * @param params - Options for the slug schema.
 * @returns A Zod object representing a document's slug.
 */
export function slug({
  by = 'definition',
  reserved = [],
  type,
  path,
  config: {
    contentDirPath,
    cache: { uniques },
  },
}: CompleteOptions) {
  return string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/i, 'Invalid slug')
    .default(generate(relative(join(contentDirPath, type), path)))
    .refine((value) => !reserved.includes(value), 'Reserved slug')
    .superRefine((value, { addIssue }) => {
      const key = makeKey({ by, type, value });
      if (uniques[key]) {
        addIssue({ fatal: true, code: 'custom', message: `duplicate slug '${value}' in '${path}` });
      } else {
        uniques[key] = path;
      }
    });
}

export function generate(path: string): string {
  const withoutFileExt = path.replace(new RegExp(extname(path) + '$'), '');
  const rawSlugSegments = withoutFileExt.split(separator);

  const slug = rawSlugSegments
    // Slugify each route segment to handle capitalization and spaces.
    // Note: using `slug` instead of `new Slugger()` means no slug deduplication.
    .map((segment) => githubSlug(segment))
    // Remove the last segment if it is "index"
    .filter((segment, index) => !(index === rawSlugSegments.length - 1 && segment === 'index'))
    .join('/');

  return slug;
}

export function makeKey({ by, type, value }: { by: SlugParams['by']; type: string; value: string }) {
  switch (by) {
    case 'definition':
      return `schemas:slug:${type}:${value}`;
    case 'global':
      return `schemas:slug:global:${value}`;
    default:
      throw new Error(`Unknown value for 'by': ${by}`);
  }
}
