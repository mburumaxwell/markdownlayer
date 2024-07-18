import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { logger } from './logger';

const emitted: Record<string, string> = {};

/**
 * Output all collected assets
 * @param options - output options
 */
export async function outputAssets({
  destination,
  assets,
}: {
  /** Output destination directory */
  destination: string;

  /** All collected assets */
  assets: Record<string, string>;
}) {
  let count = 0;
  await Promise.all(
    Object.entries(assets).map(async ([name, from]) => {
      if (emitted[name] === from) {
        logger.log(`skipped copy '${name}' with same content`);
        return;
      }
      await copyFile(from, join(destination, name));
      // logger.log(`copied '${name}' from '${from}'`)
      emitted[name] = from;
      count++;
    }),
  );
  logger.log(`output ${count} assets`);
}
