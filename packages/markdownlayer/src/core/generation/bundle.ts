import { globalExternals } from '@fal-works/esbuild-plugin-global-externals';
import Markdoc, { type Config as MarkdocConfig } from '@markdoc/markdoc';
import type { Options as CompileOptions } from '@mdx-js/esbuild';
import mdxESBuild from '@mdx-js/esbuild';
import type { BuildOptions, Plugin } from 'esbuild';
import * as esbuild from 'esbuild';
import { StringDecoder } from 'string_decoder';
import type { Pluggable, PluggableList } from 'unified';

import rehypeRaw, { type Options as RehypeRawOptions } from 'rehype-raw';
import remarkDirective from 'remark-directive';
import remarkEmoji, { type RemarkEmojiOptions } from 'remark-emoji';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm, { type Options as RemarkGfmOptions } from 'remark-gfm';

import { remarkAdmonitions, remarkHeadings, type AdmonitionPluginOptions } from '@/remark';
import type { DocumentFormat, GenerationMode, MarkdownlayerConfigPlugins } from '../types';

export type BundleProps = {
  entryPath: string;
  contents: string;
  format: DocumentFormat;
  mode: GenerationMode;
  plugins: MarkdownlayerConfigPlugins;
  frontmatter: Record<string, unknown>;
};

export type BundleResult = { code: string; errors: unknown[] };

export async function bundle({
  entryPath,
  contents,
  format,
  mode,
  plugins,
  frontmatter,
}: BundleProps): Promise<BundleResult> {
  switch (format) {
    case 'md':
    case 'mdx':
      return await bundleMdx({ entryPath, contents, format, mode, plugins, frontmatter });
    case 'mdoc':
      return await bundleMdoc({ entryPath, contents, mode, plugins, frontmatter });

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

type BundleMdocProps = Omit<BundleProps, 'format'>;

async function bundleMdoc({
  contents,
  mode,
  plugins: { markdoc },
  frontmatter,
}: BundleMdocProps): Promise<BundleResult> {
  const { allowComments = true, allowIndentation = true, slots, transformConfig } = markdoc ?? {};
  const tokenizer = new Markdoc.Tokenizer({ allowComments, allowIndentation });
  const tokens = tokenizer.tokenize(contents);
  const ast = Markdoc.parse(tokens, { slots });
  const cfg: MarkdocConfig = {
    variables: {
      ...(transformConfig ? transformConfig.variables : {}),
      // user can't override this namespace
      markdoc: { frontmatter },
    },
    ...transformConfig,
  };
  const tree = Markdoc.transform(ast, cfg);
  return {
    code: JSON.stringify(tree, null, mode == 'production' ? undefined : 2),
    errors: [],
  };
}

type BundleMdxProps = Omit<BundleProps, 'format'> & { format: 'md' | 'mdx' };

const decoder = new StringDecoder('utf8');

async function bundleMdx({ entryPath, contents, format, mode, plugins }: BundleMdxProps): Promise<BundleResult> {
  const inMemoryPlugin: Plugin = {
    name: 'in-memory-plugin',
    setup(build) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      build.onResolve({ filter: /.*/ }, ({ path: filePath, importer }) => {
        if (filePath === entryPath) {
          return {
            path: filePath,
            pluginData: { inMemory: true, contents: contents },
          };
        }

        // Return an empty object so that esbuild will handle resolving the file itself.
        return {};
      });
    },
  };

  const compileOptions = getCompileOptions({ mode, format, plugins });
  const buildOptions: BuildOptions = {
    entryPoints: [entryPath],
    write: false,
    bundle: true,
    format: 'iife',
    globalName: 'Component',
    minify: false, // let next.js handle minification
    splitting: false,
    treeShaking: false,
    target: 'es2020',
    keepNames: true,
    plugins: [
      globalExternals({
        // for some reason using esm for this fails
        react: { varName: 'React', type: 'cjs' },
        'react-dom': { varName: 'ReactDOM', type: 'cjs' },
        'react/jsx-runtime': { varName: '_jsx_runtime', type: 'cjs' },
      }),
      inMemoryPlugin,
      mdxESBuild(compileOptions),
    ],
  };

  const bundled = await esbuild.build(buildOptions);
  const code = decoder.write(Buffer.from(bundled.outputFiles![0].contents));

  return {
    code: `${code};return Component;`,
    errors: bundled.errors,
  };
}

type GetCompileOptionsProps = { format: 'md' | 'mdx'; mode: GenerationMode; plugins: MarkdownlayerConfigPlugins };
type ProcessorCacheEntry = { format: DocumentFormat; options: CompileOptions };

const ProcessorsCache = new Map<GetCompileOptionsProps['format'], ProcessorCacheEntry>();

function getCompileOptions({ mode, format, plugins }: GetCompileOptionsProps): CompileOptions {
  let cacheEntry = ProcessorsCache.get(format);
  const {
    admonitions = true,
    emoji = true,
    gfm = true,
    recmaPlugins,
    remarkPlugins,
    rehypePlugins,
    remarkRehypeOptions,
  } = plugins;

  if (!cacheEntry) {
    const options: CompileOptions = {
      development: mode === 'development', // add extra error info in development mode
      format: format,

      // configure recma plugins
      recmaPlugins: recmaPlugins ?? [],

      // configure remark plugins
      remarkPlugins: [
        // standard plugins
        remarkFrontmatter,
        remarkDirective, // necessary to handle all types of directives including admonitions (containerDirective)
        ...getAdmonitionPlugins(admonitions),
        remarkHeadings, // must be added before handling of ToC and links
        ...getRemarkEmojiPlugins(emoji),
        // remarkToc,
        ...getRemarkGfmPlugins(gfm),

        // user-provided plugins
        ...(remarkPlugins ?? []),
      ],

      // configure rehype plugins
      rehypePlugins: rehypePlugins ?? [],

      remarkRehypeOptions: remarkRehypeOptions,
    };

    if (format === 'md') {
      // This is what permits to embed HTML elements with format 'md'
      // See https://github.com/facebook/docusaurus/pull/8960
      // See https://github.com/mdx-js/mdx/pull/2295#issuecomment-1540085960
      const rehypeRawPlugin: Pluggable = [
        rehypeRaw,
        {
          passThrough: [
            'mdxFlowExpression',
            'mdxTextExpression',
            // jsx, js
            'mdxJsxFlowElement',
            'mdxJsxTextElement',
            'mdxjsEsm',
          ],
        } satisfies RehypeRawOptions,
      ];
      options.rehypePlugins!.unshift(rehypeRawPlugin);
    }

    cacheEntry = { format, options: options };
    ProcessorsCache.set(format, cacheEntry);
  }

  return cacheEntry.options;
}

function getAdmonitionPlugins(admonitions: boolean | AdmonitionPluginOptions): PluggableList {
  if (admonitions) {
    const plugin: Pluggable = admonitions === true ? remarkAdmonitions : [remarkAdmonitions, admonitions];
    return [plugin];
  }

  return [];
}

function getRemarkEmojiPlugins(emoji: boolean | RemarkEmojiOptions): PluggableList {
  if (emoji) {
    const plugin: Pluggable = emoji === true ? remarkEmoji : [remarkEmoji, emoji];
    return [plugin];
  }

  return [];
}

function getRemarkGfmPlugins(gfm: boolean | RemarkGfmOptions): PluggableList {
  if (gfm) {
    const plugin: Pluggable = gfm === true ? remarkGfm : [remarkGfm, gfm];
    return [plugin];
  }

  return [];
}
