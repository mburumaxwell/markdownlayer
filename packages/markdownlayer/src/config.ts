import * as esbuild from 'esbuild';
import { access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { name } from '../package.json';
import {
  ConfigNoDefaultExportError,
  ConfigNoDefinitionsError,
  ConfigReadError,
  MarkdownlayerErrorData,
  NoConfigFoundError,
} from './errors';
import type { MarkdownlayerConfig, ResolvedConfig } from './types';

/**
 * get the config
 * @param path specific config file path (relative or absolute)
 * @returns the config object with default values
 */
export async function getConfig(path?: string): Promise<ResolvedConfig> {
  // prettier-ignore
  const files = path != null ? [path] : [
    name + '.config.js',
    name + '.config.ts',
    name + '.config.mjs',
    name + '.config.mts',
    name + '.config.cjs',
    name + '.config.cts'
  ]

  const configPath = await searchFiles(files);
  if (configPath == null) {
    throw new NoConfigFoundError({
      ...MarkdownlayerErrorData.NoConfigFoundError,
      message: MarkdownlayerErrorData.NoConfigFoundError.message({ path }),
    });
  }

  const [loadedConfig, configHash, configImports] = await loadConfig(configPath);

  const cwd = dirname(configPath);

  return {
    ...loadedConfig,
    configPath,
    configHash,
    configImports,
    cache: { uniques: {}, data: { items: {} } }, // data cache is populated later
    contentDirPath: resolve(cwd, loadedConfig.contentDirPath ?? 'content'),
    output: {
      ...loadedConfig.output,
      assets: resolve(cwd, loadedConfig.output?.assets ?? 'public/static'),
      base: loadedConfig.output?.base ?? '/static/',
      format: loadedConfig.output?.format ?? '[name]-[hash:8].[ext]',
    },
  };
}

/**
 * recursive 3-level search files in cwd and its parent directories
 * @param files filenames (relative or absolute)
 * @param cwd start directory
 * @param depth search depth
 * @returns filename first searched
 */
async function searchFiles(
  files: string[],
  cwd: string = process.cwd(),
  depth: number = 3,
): Promise<string | undefined> {
  for (const file of files) {
    try {
      const configPath = resolve(cwd, file);
      await access(configPath); // check file exists
      return configPath;
    } catch {
      continue;
    }
  }
  if (depth > 0 && !(cwd === '/' || cwd.endsWith(':\\'))) {
    return await searchFiles(files, dirname(cwd), depth - 1);
  }
}

/**
 * bundle and load user config file
 * @param path config file path
 * @returns user config object and dependencies
 */
async function loadConfig(path: string): Promise<[MarkdownlayerConfig, string, string[]]> {
  if (!/\.(js|mjs|cjs|ts|mts|cts)$/.test(path)) {
    const ext = path.split('.').pop();
    throw new Error(`not supported config file with '${ext}' extension`);
  }

  const outfile = join(path, `../.${name}/cache/compiled-markdownlayer-config.mjs`);

  const result = await esbuild.build({
    entryPoints: [path],
    entryNames: '[name]-[hash]',
    outfile,
    bundle: true,
    write: true,
    format: 'esm',
    target: 'node18',
    platform: 'node',
    metafile: true,
    packages: 'external',
  });

  if (result.errors.length > 0) {
    const error = result.errors[0];
    throw new ConfigReadError({
      ...MarkdownlayerErrorData.ConfigReadError,
      message: error.text,
      location: {
        file: path,
        column: error.location?.column,
        line: error.location?.line,
      },
      hint: error.location?.suggestion,
    });
  }

  // Will look like `node_modules/compiled-markdownlayer-config-[SOME_HASH].mjs'
  const format = /compiled-markdownlayer-config-([a-zA-Z0-9]+).mjs$/;
  const outputFile = Object.keys(result.metafile!.outputs).find((f) => f.match(format) !== null);
  if (!outputFile) {
    throw new ConfigReadError({
      ...MarkdownlayerErrorData.ConfigReadError,
      message: 'Could not find output file name',
    });
  }
  const hash = outputFile.match(format)![1]!;

  const configUrl = pathToFileURL(outputFile);
  configUrl.searchParams.set('t', Date.now().toString()); // prevent import cache

  let mod;
  try {
    mod = await import(configUrl.href);
  } catch (error) {
    throw new ConfigReadError({
      ...MarkdownlayerErrorData.ConfigReadError,
      message: MarkdownlayerErrorData.ConfigReadError.message({ path, error: error as Error }),
      stack: (error as Error).stack,
      location: { file: outputFile },
    });
  }

  if (!('default' in mod)) {
    throw new ConfigNoDefaultExportError({
      ...MarkdownlayerErrorData.ConfigNoDefaultExportError,
      message: MarkdownlayerErrorData.ConfigNoDefaultExportError.message({ path, availableExports: Object.keys(mod) }),
    });
  }

  if (!('definitions' in mod.default)) {
    throw new ConfigNoDefinitionsError({
      ...MarkdownlayerErrorData.ConfigNoDefinitionsError,
      message: MarkdownlayerErrorData.ConfigNoDefinitionsError.message({ path }),
    });
  }

  const deps = Object.keys(result.metafile.inputs).map((file) => join(path, '..', file));

  return [mod.default, hash, deps];
}
