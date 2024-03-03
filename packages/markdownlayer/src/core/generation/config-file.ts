import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

import type { MarkdownlayerConfig } from '../types';
import { ConfigNoDefaultExportError, ConfigReadError, NoConfigFoundError } from './errors';

const possibleConfigFileNames = ['markdownlayer.config.ts', 'markdownlayer.config.js'];

export type GetConfigOptions = {
  cwd: string;
  outputFolder: string;
};

export type GetConfigResult = {
  configHash: string;
  config: MarkdownlayerConfig;
};

export async function getConfig({ cwd, outputFolder }: GetConfigOptions): Promise<GetConfigResult> {
  let configPath: string | null = null;
  for (const name of possibleConfigFileNames) {
    configPath = path.join(cwd, name);
    if (fs.existsSync(configPath)) break;
  }

  if (!configPath) {
    throw new NoConfigFoundError({ cwd });
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
    plugins: [markdownlayerGenPlugin(), makeAllPackagesExternalPlugin(configPath)],
  };

  const buildResult = await esbuild.build(buildOptions);
  // TODO: for dev mode, we need to watch the config file and recompile on change
  // const buildContext = await esbuild.context({
  //   ...buildOptions,
  //   plugins: [...(buildOptions.plugins ?? []), watchPlugin(configPath)],
  // } satisfies esbuild.BuildOptions);
  // const buildResult = await buildContext.build();
  // await buildContext.watch();

  // Will look like `path.join(cacheDir, 'compiled-markdownlayer-config-[SOME_HASH].mjs')
  const outputFileName = Object.keys(buildResult.metafile!.outputs).find(
    (f) => f.match(/compiled-markdownlayer-config-.+.mjs$/) !== null,
  );
  if (!outputFileName) throw new Error('Could not find output file name');
  // Needs to be absolute path for ESM import to work
  outputPath = path.join(cwd, outputFileName);

  const esbuildHash = outputPath.match(/compiled-markdownlayer-config-(.+).mjs$/)![1]!;

  // Needed in order for source maps of dynamic file to work
  try {
    (await import('source-map-support')).install();
  } catch (error: any) {
    throw new ConfigReadError({ error, configPath });
  }

  let exports: any;
  try {
    // NOTES:
    // 1) `?x=` suffix needed in case of re-loading when watching the config file for changes
    // 2) `file://` prefix is needed for Windows to work properly
    exports = await import(`file://${outputPath}?x=${Date.now()}`);
  } catch (error: any) {
    throw new ConfigReadError({ error, configPath });
  }

  if (!('default' in exports)) {
    throw new ConfigNoDefaultExportError({ configPath, availableExports: Object.keys(exports) });
  }

  return {
    configHash: esbuildHash,
    config: exports.default as MarkdownlayerConfig,
  };
}

// function watchPlugin(configPath: string): esbuild.Plugin {
//   return ({
//     name: 'markdownlayer-watch-plugin',
//     setup(build) {
//       let isFirstBuild = false

//       build.onEnd((result) => {
//         // runtime.runFiber(OT1.addEvent('esbuild-build-result', { result: JSON.stringify(result) }))

//         // if (isFirstBuild) {
//         //   isFirstBuild = false
//         // } else {
//         //   if (result.errors.length > 0) {
//         //     runtime.runFiber(
//         //       H.publish_(fsEventsHub, Ex.succeed(E.left(new KnownEsbuildError({ error: result.errors })))),
//         //     )
//         //   } else {
//         //     runtime.runFiber(H.publish_(fsEventsHub, Ex.succeed(E.right(result!))))
//         //   }
//         // }
//       })
//     },
//   })
// }

/**
 * This esbuild plugin is needed in some cases where users import code that imports from '.markdownlayer/*'
 * (e.g. when co-locating document type definitions with React components).
 */
function markdownlayerGenPlugin(): esbuild.Plugin {
  return {
    name: 'markdownlayer-gen',
    setup(build) {
      build.onResolve({ filter: /markdownlayer\/generated/ }, (args) => ({
        path: args.path,
        namespace: 'markdownlayer-gen',
      }));

      build.onLoad({ filter: /.*/, namespace: 'markdownlayer-gen' }, () => ({
        contents: '// empty',
      }));
    },
  };
}

// TODO also take tsconfig.json `paths` mapping into account
function makeAllPackagesExternalPlugin(configPath: string): esbuild.Plugin {
  return {
    name: 'make-all-packages-external',
    setup: (build) => {
      const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/; // Must not start with "/" or "./" or "../"
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
