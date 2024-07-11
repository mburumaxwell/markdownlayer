import type { StaticImageData } from 'next/dist/shared/lib/image-external'; // this is what is used when you import the file in a Next.js project
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { z } from 'zod';

import type { GenerationMode, ImageSchemaFunctionOptions, StaticImageDataSchema } from '../types';

type CreateImageOptions = ImageSchemaFunctionOptions & {
  mode: GenerationMode;
  shouldEmitFile: boolean;
  sourceFilePath: string;
};

export function createImage({
  optional,
  shouldEmitFile,
  sourceFilePath,
  ...remaining
}: CreateImageOptions): StaticImageDataSchema {
  const schema = optional ? z.string({ ...remaining }).optional() : z.string({ ...remaining });
  const transformed = schema.transform(async (imagePath, context) => {
    if (!imagePath) return z.never();

    const resolvedFilePath = join(dirname(sourceFilePath), imagePath);
    const metadata = await emitImage({ resolvedFilePath, shouldEmitFile });

    if (!metadata) {
      context.addIssue({
        code: 'custom',
        message: `Image ${imagePath} does not exist. Is the path correct?`,
        fatal: true,
      });

      return z.never();
    }

    return metadata;
  });

  // @ts-expect-error - The type is correct but the error is due to the transform function
  return transformed;
}

type EmitImageOptions = { resolvedFilePath: string; shouldEmitFile: boolean };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function emitImage({ resolvedFilePath, shouldEmitFile }: EmitImageOptions): Promise<StaticImageData | undefined> {
  if (!existsSync(resolvedFilePath)) return undefined;

  throw new Error('Image functionality is not fully implemented.');
}
