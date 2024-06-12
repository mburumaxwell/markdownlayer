import type { WebpackOptionsNormalized } from 'webpack';

import { type MarkdownlayerConfig } from '@/core';
import { generate, type GenerateOptions } from '@/core/generation';

/** Seems like the next.config.js export function might be executed multiple times, so we need to make sure we only run it once */
let markdownInitialized = false;

export async function runBeforeWebpackCompile({
  mode,
  devServerStartedRef,
  pluginConfig,
}: {
  mode: WebpackOptionsNormalized['mode'];
  devServerStartedRef: { current: boolean };
  pluginConfig?: MarkdownlayerConfig;
}) {
  if (markdownInitialized) return;
  markdownInitialized = true;

  const dev = mode === 'development';
  const prod = mode === 'production';
  if (!dev && !prod) throw new Error(`Unexpected mode: ${mode}`);

  const options: GenerateOptions = { mode, pluginConfig };

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
