import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { object, string, union } from 'zod';

import { getImageMetadata, processAsset } from '../assets';
import type { ImageData, ResolvedConfig } from '../types';

export type ImageParams = {
  /**
   * Whether to allow remote URLs such as `https://example.com/image.png`.
   *
   * @default false
   */
  remote?: boolean;

  /**
   * Whether to emit non-remote images to the output.
   * This can be disabled if you only need the metadata such as when the image
   * is already in the output directory.
   *
   * @default true
   */
  emit?: boolean;
};

type CompleteOptions = ImageParams & {
  path: string;
  config: ResolvedConfig;
};

/**
 * Schema for an image.
 * @param options - Options for the image schema.
 * @returns A Zod object representing an image.
 */
export function image({ remote = false, emit = true, path, config: { output } }: CompleteOptions) {
  return union([string(), object({ src: string(), alt: string().optional() })]).transform<ImageData>(
    async (value, { addIssue }) => {
      const { src, alt } = typeof value === 'string' ? { src: value, alt: undefined } : value;
      try {
        // checks if the string starts with http:// or https://
        if (/^https?:\/\//.test(src)) {
          // ensure remote URLs are allowed
          if (!remote) throw new Error('Remote images must be explicitly allowed');

          const response = await fetch(src);
          if (!response.ok) throw new Error(`Failed to fetch image at ${src}`);
          const buffer = await (await response.blob()).arrayBuffer();
          const metadata = await getImageMetadata(Buffer.from(buffer));
          if (!metadata) throw new Error(`Failed to extract image metadata from ${src}`);
          return { src, alt, ...metadata };
        }

        // at this point, it is not a remote URL

        // ensure the file exists
        const resolvedFilePath = resolve(path, '..', src);
        if (!existsSync(resolvedFilePath)) throw new Error(`Image ${src} does not exist. Is the path correct?`);

        const buffer = await readFile(path);

        // if not emitting, we only need to get the metadata
        if (!emit) {
          const metadata = await getImageMetadata(buffer);
          if (!metadata) throw new Error(`Failed to extract image metadata from ${resolvedFilePath}`);
          return { src, alt, ...metadata };
        }

        return {
          ...(await processAsset({ input: src, from: path, format: output.format, baseUrl: output.base }, true)),
          alt,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        addIssue({ fatal: true, code: 'custom', message });
        return null as never;
      }
    },
  );
}
