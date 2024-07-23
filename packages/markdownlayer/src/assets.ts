import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import type { FormatEnum } from 'sharp';
import { type ImageData, type ImageFormat, ImageFormats } from './types';

/** Assets to be copied to the output directory. */
export const assets: Record<string, string> = {};

/**
 * Retrieves metadata for an image buffer and generates a blurred version of the image.
 * @param buffer - The image buffer.
 * @returns The image metadata
 */
export async function getImageMetadata(buffer: Buffer): Promise<Omit<ImageData, 'src'> | undefined> {
  const { default: sharp } = await import('sharp');
  const img = sharp(buffer);
  const { format, width, height } = await img.metadata();
  if (format == null || width == null || height == null) return;
  if (!isValidImageFormat(format)) return;

  const aspectRatio = width / height;
  const blurWidth = 8;
  const blurHeight = Math.round(blurWidth / aspectRatio);
  const blurImage = await img.resize(blurWidth, blurHeight).webp({ quality: 1 }).toBuffer();
  const blurDataURL = `data:image/webp;base64,${blurImage.toString('base64')}`;
  return { format, height, width, blurDataURL, blurWidth, blurHeight, aspectRatio };
}

export async function processAsset<T extends true | undefined = undefined>(
  {
    input,
    from,
    format,
    baseUrl,
  }: {
    input: string;
    from: string;
    format: string;
    baseUrl: string;
  },
  isImage?: T,
): Promise<T extends true ? ImageData : string> {
  // e.g. input = '../assets/image.png?foo=bar#hash'
  const queryIdx = input.indexOf('?');
  const hashIdx = input.indexOf('#');
  const index = Math.min(queryIdx >= 0 ? queryIdx : Infinity, hashIdx >= 0 ? hashIdx : Infinity);
  const suffix = input.slice(index);
  const path = resolve(from, '..', input);
  const ext = extname(path);
  const buffer = await readFile(path);
  const name = format.replace(/\[(name|hash|ext)(:(\d+))?\]/g, (substring, ...groups) => {
    const key = groups[0];
    const length = groups[2] == null ? undefined : parseInt(groups[2]);
    switch (key) {
      case 'name':
        return basename(path, ext).slice(0, length);
      case 'hash':
        return createHash('sha256').update(buffer).digest('hex').slice(0, length);
      case 'ext':
        return ext.slice(1, length);
    }
    return substring;
  });

  const src = baseUrl + name + suffix;
  assets[name] = path; // track asset for copying later

  if (!isImage) return src as T extends true ? ImageData : string;

  const metadata = await getImageMetadata(buffer);
  if (metadata == null) throw new Error(`invalid image: ${from}`);
  return { src, ...metadata } as T extends true ? ImageData : string;
}

export function isValidImageFormat(format: keyof FormatEnum): format is ImageFormat {
  return (ImageFormats as readonly string[]).includes(format);
}
