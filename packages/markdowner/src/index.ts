import type { NextConfig } from 'next';
import webpack from 'webpack';

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
 * Next.js plugin for Markdowner.
 *
 * @example
 * ```js
 * // next.config.mjs
 * import { withMarkdowner } from 'markdowner'
 *
 * export default withMarkdowner({
 *   // My Next.js config
 * })
 * ```
 */
export function withMarkdowner(nextConfig?: Partial<NextConfig>): Partial<NextConfig> {
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
        // ignored: /node_modules([\\]+|\/)+(?!\.markdowner)/,
        ignored: ['**/node_modules/!(.markdowner)/**/*'],
      };

      config.plugins!.push(new MarkdownWebpackPlugin());

      if (typeof nextConfig?.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  } satisfies NextConfig;
}

class MarkdownWebpackPlugin {
  apply(compiler: webpack.Compiler) {
    compiler.hooks.beforeCompile.tapPromise('MarkdownerWebpackPlugin', async () => {
      await runBeforeWebpackCompile({
        devServerStartedRef,
        mode: compiler.options.mode,
      });
    });
  }
}
