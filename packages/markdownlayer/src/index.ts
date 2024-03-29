import type { NextConfig } from 'next';
import webpack from 'webpack';

import { type MarkdownlayerConfig } from './core';
import { runBeforeWebpackCompile } from './plugin';

const devServerStartedRef = { current: false };

interface WebpackConfigContext {
  /** Next.js root directory */
  dir: string;
  /** Indicates if the compilation will be done in development */
  dev: boolean;
  /** It's `true` for server-side compilation, and `false` for client-side compilation */
  isServer: boolean;
  /**  The build id, used as a unique identifier between builds */
  buildId: string;
  /** The current server runtime */
  nextRuntime?: 'nodejs' | 'edge';
}

/**
 * Next.js plugin for markdownlayer.
 * @argument nextConfig - The Next.js configuration, if any.
 * @argument pluginConfig
 * The markdownlayer configuration, if any.
 * When provided, markdownlayer.config.ts will be ignored.
 * This will become the only supported configuration method
 * once next.config.ts is supported in https://github.com/vercel/next.js/pull/63051.
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
 * export default withMarkdownlayer({
 *   // My Next.js config
 * }, {
 *  // My markdownlayer config (will ignore markdownlayer.config.js)
 * })
 * ```
 */
export function withMarkdownlayer(
  nextConfig?: Partial<NextConfig>,
  pluginConfig?: MarkdownlayerConfig,
): Partial<NextConfig> {
  return {
    ...nextConfig,
    onDemandEntries: {
      maxInactiveAge: 60 * 60 * 1000, // extend `maxInactiveAge` to 1 hour (from 15 sec by default)
      ...nextConfig?.onDemandEntries, // use existing onDemandEntries config if provided by user
    },
    webpack(config: webpack.Configuration, options: any) {
      const { buildId, dev, isServer, nextRuntime } = options as WebpackConfigContext;

      config.watchOptions = {
        ...config.watchOptions,
        // ignored: /node_modules([\\]+|\/)+(?!\.markdownlayer)/,
        ignored: ['**/node_modules/!(.markdownlayer)/**/*'],
      };

      config.plugins!.push(new MarkdownWebpackPlugin(pluginConfig));

      if (typeof nextConfig?.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  } satisfies NextConfig;
}

class MarkdownWebpackPlugin {
  constructor(private readonly pluginConfig: MarkdownlayerConfig | undefined | null) {}

  apply(compiler: webpack.Compiler) {
    compiler.hooks.beforeCompile.tapPromise('MarkdownlayerWebpackPlugin', async () => {
      await runBeforeWebpackCompile({
        devServerStartedRef,
        mode: compiler.options.mode,
        pluginConfig: this.pluginConfig,
      });
    });
  }
}
