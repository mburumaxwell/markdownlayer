import type { NextConfig } from 'next';
import type { WebpackConfigContext } from 'next/dist/server/config-shared';
import type webpack from 'webpack';

import { runBeforeWebpackCompile } from './plugin';

const devServerStartedRef = { current: false };

/**
 * Next.js plugin for markdownlayer.
 * @argument nextConfig - The Next.js configuration, if any.
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
 */
export function withMarkdownlayer(nextConfig?: Partial<NextConfig>): Partial<NextConfig> {
  return {
    ...nextConfig,
    onDemandEntries: {
      maxInactiveAge: 60 * 60 * 1000, // extend `maxInactiveAge` to 1 hour (from 15 sec by default)
      ...nextConfig?.onDemandEntries, // use existing onDemandEntries config if provided by user
    },
    webpack(config: webpack.Configuration, options: WebpackConfigContext) {
      const { buildId, dev, isServer, nextRuntime } = options; // eslint-disable-line @typescript-eslint/no-unused-vars

      // contentlayer has (and we initially had) watch options that allowed watching the node_modules folder except for itself
      // we do not have that here because we may want a recompilation if the package is update during a dev session

      config.plugins!.push(new MarkdownWebpackPlugin());

      if (typeof nextConfig?.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  } satisfies NextConfig;
}

class MarkdownWebpackPlugin {
  constructor() {}

  apply(compiler: webpack.Compiler) {
    compiler.hooks.beforeCompile.tapPromise('MarkdownlayerWebpackPlugin', async () => {
      await runBeforeWebpackCompile({
        devServerStartedRef,
        mode: compiler.options.mode,
      });
    });
  }
}
