import { generate } from './generate';
import type { GenerationMode } from './types';

export type MayBePromise<T> = T | Promise<T>;

export type MarkdownlayerPluginOptions = {
  configPath?: string;
};

const defaultOptions: MarkdownlayerPluginOptions = {
  configPath: 'markdownlayer.config.ts',
};

/**
 * Next.js plugin for markdownlayer.
 * @argument nextConfig - The Next.js configuration, if any.
 *
 * @remarks
 * Ensure that this is the last plugin in the chain because it returns a Promise,
 * which is compatible with Next.js, but other plugins may not expect this behavior.
 *
 * @example
 * ```js
 * // next.config.mjs
 * import { withMarkdownlayer } from 'markdownlayer'
 *
 * export default withMarkdownlayer({
 *   // My Next.js config
 * })
 * ```
 *
 * @example
 * ```js
 * // next.config.mjs
 * import { withMarkdownlayer } from 'markdownlayer'
 *
 * export default withMarkdownlayer(withNextIntl({
 *   // My Next.js config
 * }))
 * ```
 */
export const withMarkdownlayer = createMarkdownlayerPlugin(defaultOptions);

// a custom type instead of importing from next we are
// targeting multiple versions with major differences
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NextConfig = Record<string, any>;

export function createMarkdownlayerPlugin(pluginOptions: MarkdownlayerPluginOptions) {
  return async function (nextConfig: MayBePromise<Partial<NextConfig>> = {}): Promise<Partial<NextConfig>> {
    const [command] = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
    if (command === 'build' || command === 'dev') {
      const mode: GenerationMode = command === 'dev' ? 'development' : 'production';

      await generate({ mode, ...pluginOptions });
    }

    return nextConfig;
  };
}
