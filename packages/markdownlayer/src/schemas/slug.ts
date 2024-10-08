import { extname, join, relative, sep as separator } from 'node:path';
import { string } from 'zod';
import type { ResolvedMarkdownlayerConfig } from '../types';

export type SlugParams = {
  /**
   * Minimum length of the slug.
   * @default 3
   */
  min?: number;

  /**
   * Maximum length of the slug.
   * @default 200
   */
  max?: number;

  /**
   * Regular expression to match the slug.
   * @default /^$|^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/i
   *
   * @remark
   * The default regex allows for slugs with or without a leading directory,
   * and to allow for slugs with or without a trailing directory.
   * It also allows for empty strings such as when dealing with `index.md` or `index/index.md`.
   */
  regex?: RegExp;

  /**
   * Whether to use the default value.
   * @default true
   */
  default?: boolean;

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
  defaultValue: string;
  config: ResolvedMarkdownlayerConfig;
};

/**
 * Schema for a document's slug.
 * @param params - Options for the slug schema.
 * @returns A Zod object representing a document's slug.
 */
export function slug({
  min = 3,
  max = 200,
  regex = /^$|^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/i,
  default: useDefault = true,
  by = 'definition',
  reserved = [],
  type,
  path,
  defaultValue,
  config: {
    contentDirPath,
    cache: { uniques },
  },
}: CompleteOptions) {
  const common = string()
    .min(min)
    .max(max)
    .regex(regex, 'Invalid slug')
    .refine((value) => !reserved.includes(value), 'Reserved slug');

  const base = useDefault ? common.default(defaultValue) : common;
  return base.superRefine((value, { addIssue }) => {
    const key = makeKey({ by, type, value });
    if (uniques[key]) {
      addIssue({
        fatal: true,
        code: 'custom',
        message: `duplicate slug '${value}' in '${relative(contentDirPath, path)}'`,
      });
    } else {
      uniques[key] = path;
    }
  });
}

type GenerateDefaultOptions = Pick<CompleteOptions, 'type' | 'path' | 'config'>;
export function generateDefault({ type, path, config }: GenerateDefaultOptions): Promise<string> {
  return generate(relative(join(config.contentDirPath, type), path));
}

export async function generate(path: string): Promise<string> {
  const { slug: githubSlug } = await import('github-slugger');

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
