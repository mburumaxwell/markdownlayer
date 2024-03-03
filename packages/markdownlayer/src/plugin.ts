import type { WebpackOptionsNormalized } from 'webpack';

import { generate, type GenerateOptions } from '@/core';

/** Seems like the next.config.js export function might be executed multiple times, so we need to make sure we only run it once */
let markdownInitialized = false;

export async function runBeforeWebpackCompile({
  mode,
  devServerStartedRef,
}: {
  mode: WebpackOptionsNormalized['mode'];
  devServerStartedRef: { current: boolean };
}) {
  if (markdownInitialized) return;
  markdownInitialized = true;

  const dev = mode === 'development';
  const prod = mode === 'production';
  if (!dev && !prod) throw new Error(`Unexpected mode: ${mode}`);

  const options: GenerateOptions = { mode };

  if (prod) {
    await generate(options);
    return;
  }

  if (dev && !devServerStartedRef.current) {
    devServerStartedRef.current = true;

    // generate (first time)
    await generate(options);
  }
}
