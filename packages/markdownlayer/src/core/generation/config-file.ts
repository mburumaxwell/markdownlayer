import * as esbuild from 'esbuild';
import fs from 'fs';
import hash from 'object-hash';
import path from 'path';

import { ConfigNoDefaultExportError, ConfigReadError, MarkdownlayerErrorData, NoConfigFoundError } from '../errors';
import type { MarkdownlayerConfig } from '../types';

const possibleConfigFileNames = ['markdownlayer.config.ts', 'markdownlayer.config.js'];

/** Represents the options for getting the configuration. */
export type GetConfigOptions = {
  /** The current working directory. */
  cwd: string;

  /**
   * The output folder for the compiled file.
   *
   * @example /Users/mike/Documents/markdownlayer/examples/starter/.markdownlayer
   */
  outputFolder: string;

  /** The configuration, if any, that is passed via the NextJS plugin. */
  pluginConfig?: MarkdownlayerConfig;

  /**
   * The path to the current configuration file, if any.
   * This is only set when getting the configuration file subsequent times which should only happen when watching the file for changes.
   */
  currentConfigPath?: string;
};

/** Represents the result of getting the configuration. */
export type GetConfigResult = {
  /** The path to the configuration file. */
  configPath?: string;

  /**
   * The hash of the configuration.
   * This is used to determine if the configuration has changed.
   */
  configHash: string;

  /** The configuration. */
  config: MarkdownlayerConfig;
};

export async function getConfig(options: GetConfigOptions): Promise<GetConfigResult> {
  const { cwd, outputFolder, pluginConfig, currentConfigPath } = options;

  if (pluginConfig) {
    return {
      configHash: hash(pluginConfig, {}),
      config: pluginConfig,
    };
  }

  let configPath: string | undefined = currentConfigPath;
  if (configPath && !fs.existsSync(configPath)) {
    throw new NoConfigFoundError({
      ...MarkdownlayerErrorData.NoConfigFoundError,
      message: MarkdownlayerErrorData.NoConfigFoundError.message({ cwd, configPath }),
    });
  }

  if (!configPath) {
    for (const name of possibleConfigFileNames) {
      configPath = path.join(cwd, name);
      if (fs.existsSync(configPath)) break;
    }
  }

  if (!configPath) {
    throw new NoConfigFoundError({
      ...MarkdownlayerErrorData.NoConfigFoundError,
      message: MarkdownlayerErrorData.NoConfigFoundError.message({ cwd }),
    });
  }

  const cacheDir = path.join(outputFolder, 'cache');
  let outputPath = path.join(cacheDir, 'compiled-markdownlayer-config.mjs');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const buildOptions: esbuild.BuildOptions = {
    entryPoints: [configPath],
    entryNames: '[name]-[hash]',
    outfile: outputPath,
    sourcemap: true,
    platform: 'node',
    target: 'es2020',
    format: 'esm',
    // needed in case models are co-located with React components
    jsx: 'transform',
    bundle: true,
    logLevel: 'silent',
    metafile: true,
    absWorkingDir: cwd,
    plugins: [makeAllPackagesExternalPlugin(configPath)],
  };

  // Build the configuration file
  const buildResult = await esbuild.build(buildOptions);
  if (buildResult.errors.length > 0) {
    const error = buildResult.errors[0];
    throw new ConfigReadError({
      ...MarkdownlayerErrorData.ConfigReadError,
      message: error.text,
      location: {
        file: configPath,
        column: error.location?.column,
        line: error.location?.line,
      },
      hint: error.location?.suggestion,
    });
  }

  // Will look like `path.join(cacheDir, 'compiled-markdownlayer-config-[SOME_HASH].mjs')
  const outputFileName = Object.keys(buildResult.metafile!.outputs).find(
    (f) => f.match(/compiled-markdownlayer-config-.+.mjs$/) !== null,
  );
  if (!outputFileName) {
    throw new ConfigReadError({
      ...MarkdownlayerErrorData.ConfigReadError,
      message: 'Could not find output file name',
    });
  }
  outputPath = path.join(cwd, outputFileName); // Needs to be absolute path for ESM import to work

  const esbuildHash = outputPath.match(/compiled-markdownlayer-config-(.+).mjs$/)![1]!;

  // Needed in order for source maps of dynamic file to work
  try {
    (await import('source-map-support')).install();
  } catch (error) {
    throw new ConfigReadError({
      ...MarkdownlayerErrorData.ConfigReadError,
      message: MarkdownlayerErrorData.ConfigReadError.message({
        configPath,
        error: error as Error,
      }),
      stack: (error as Error).stack,
    });
  }

  let exports: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    // NOTES:
    // 1) `?x=` suffix needed in case of re-loading when watching the config file for changes
    // 2) `file://` prefix is needed for Windows to work properly
    exports = await import(`file://${outputPath}?x=${Date.now()}`);
  } catch (error) {
    throw new ConfigReadError({
      ...MarkdownlayerErrorData.ConfigReadError,
      message: MarkdownlayerErrorData.ConfigReadError.message({
        configPath,
        error: error as Error,
      }),
      stack: (error as Error).stack,
      location: {
        file: outputPath,
      },
    });
  }

  if (!('default' in exports)) {
    throw new ConfigNoDefaultExportError({
      ...MarkdownlayerErrorData.ConfigNoDefaultExportError,
      message: MarkdownlayerErrorData.ConfigNoDefaultExportError.message({
        configPath,
        availableExports: Object.keys(exports),
      }),
    });
  }

  return {
    configPath: configPath,
    configHash: esbuildHash,
    config: exports.default as MarkdownlayerConfig,
  };
}

function makeAllPackagesExternalPlugin(configPath: string): esbuild.Plugin {
  return {
    name: 'make-all-packages-external',
    setup: (build) => {
      const filter = /^[^./]|^\.[^./]|^\.\.[^/]/; // Must not start with "/" or "./" or "../"
      build.onResolve({ filter }, (args) => {
        // avoid marking config file as external
        if (args.path.includes(configPath)) {
          return { path: args.path, external: false };
        }

        return { path: args.path, external: true };
      });
    },
  };
}
