import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it, vi } from 'vitest';
import { assets, getImageMetadata, isValidImageFormat, processAsset } from './assets';
import type { ImageData } from './types';

vi.mock('node:fs/promises');

describe('getImageMetadata', () => {
  it('should return metadata for a valid image buffer', async () => {
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const metadata = await getImageMetadata(buffer);
    expect(metadata).toEqual({
      format: 'png',
      width: 100,
      height: 100,
      blurDataURL: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoIAAgADMDOJaQAA3AA/uuuAAA=',
      blurWidth: 8,
      blurHeight: 8,
      aspectRatio: 1,
    } satisfies Omit<ImageData, 'src'>);
  });

  it('should return undefined for an invalid image buffer', async () => {
    const buffer = Buffer.from('invalid image data');
    await expect(getImageMetadata(buffer)).rejects.toThrow();
  });
});

describe('processAsset', () => {
  it('should process an asset and return its metadata', async () => {
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const input = 'image.png';
    const from = __dirname;
    const format = '[name].[hash:8].[ext]';

    vi.mocked(readFile).mockResolvedValue(buffer);

    const metadata = await processAsset({ input, from, format, baseUrl: '/static/' });
    expect(metadata).toEqual({
      src: '/static/image.e23151fe.png',
      format: 'png',
      width: 100,
      height: 100,
      blurDataURL: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoIAAgADMDOJaQAA3AA/uuuAAA=',
      blurWidth: 8,
      blurHeight: 8,
      aspectRatio: 1,
    } satisfies ImageData);

    // Check that the asset is added to the assets map
    expect(assets['image.e23151fe.png']).toBe(join(from, '..') + '/' + input);
  });
});
describe('isValidImageFormat', () => {
  it('should return true for valid image formats', () => {
    expect(isValidImageFormat('jpeg')).toBe(true);
    expect(isValidImageFormat('png')).toBe(true);
    expect(isValidImageFormat('webp')).toBe(true);
    expect(isValidImageFormat('gif')).toBe(true);
    expect(isValidImageFormat('tiff')).toBe(true);
    expect(isValidImageFormat('svg')).toBe(true);
  });

  it('should return false for invalid image formats', () => {
    expect(isValidImageFormat('heif')).toBe(false);
    expect(isValidImageFormat('jp2')).toBe(false);
    expect(isValidImageFormat('pdf')).toBe(false);
  });
});
