import { globalExternals } from '@fal-works/esbuild-plugin-global-externals';
import Markdoc, { type Config as MarkdocConfig } from '@markdoc/markdoc';
import type { Options as CompileOptions } from '@mdx-js/esbuild';
import mdxESBuild from '@mdx-js/esbuild';
import type { BuildOptions, Plugin } from 'esbuild';
import esbuild, { type Message } from 'esbuild';
import { StringDecoder } from 'node:string_decoder';
import rehypeRaw, { type Options as RehypeRawOptions } from 'rehype-raw';
import remarkDirective from 'remark-directive';
import remarkEmoji from 'remark-emoji';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import type { Pluggable, PluggableList } from 'unified';

import { remarkAdmonitions, remarkHeadings } from './remark';
import type { DocumentFormat, MarkdownlayerConfigPlugins } from './types';

export type BundleProps = {
  entryPath: string;
  contents: string;
  format: DocumentFormat;
  plugins: MarkdownlayerConfigPlugins;
  frontmatter: Record<string, unknown>;
};

export type BundleResult = { code: string; errors: Message[] };

export async function bundle({ format, ...options }: BundleProps): Promise<BundleResult> {
  switch (format) {
    case 'md':
    case 'mdx':
      return await mdx({ format, ...options });
    case 'mdoc':
      return await mdoc({ ...options });

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

type BundleMdocProps = Omit<BundleProps, 'entryPath' | 'format'>;

async function mdoc({ contents, plugins: { markdoc }, frontmatter }: BundleMdocProps): Promise<BundleResult> {
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
    code: JSON.stringify(tree, null, 2),
    errors: [],
  };
}

type BundleMdxProps = Omit<BundleProps, 'format' | 'frontmatter'> & { format: 'md' | 'mdx' };

const decoder = new StringDecoder('utf8');

async function mdx({ entryPath, contents, format, plugins }: BundleMdxProps): Promise<BundleResult> {
  const inMemoryPlugin: Plugin = {
    name: 'in-memory-plugin',
    setup(build) {
      build.onResolve({ filter: /.*/ }, ({ path: filePath }) => {
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

  const compileOptions = getCompileOptions({ format, plugins });
  const buildOptions: BuildOptions = {
    entryPoints: [entryPath],
    write: false,
    bundle: true,
    format: 'iife',
    globalName: 'Component',
    minify: false, // let the bundling framework handle the minification
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

type GetCompileOptionsProps = { format: 'md' | 'mdx'; plugins: MarkdownlayerConfigPlugins };
type ProcessorCacheEntry = { format: DocumentFormat; options: CompileOptions };

const ProcessorsCache = new Map<GetCompileOptionsProps['format'], ProcessorCacheEntry>();

function getCompileOptions({ format, plugins }: GetCompileOptionsProps): CompileOptions {
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
      format,
      recmaPlugins,
      rehypePlugins,
      remarkRehypeOptions,

      // configure remark plugins
      remarkPlugins: [
        // standard plugins
        remarkFrontmatter,
        remarkDirective, // necessary to handle all types of directives including admonitions (containerDirective)
        ...((admonitions
          ? [admonitions === true ? remarkAdmonitions : [remarkAdmonitions, admonitions]]
          : []) as PluggableList),
        remarkHeadings, // must be added before handling of ToC and links
        ...((emoji ? [emoji === true ? remarkEmoji : [remarkEmoji, emoji]] : []) as PluggableList),
        // remarkToc,
        ...((gfm ? [gfm === true ? remarkGfm : [remarkGfm, gfm]] : []) as PluggableList),

        // user-provided plugins
        ...(remarkPlugins ?? []),
      ],
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

    cacheEntry = { format, options };
    ProcessorsCache.set(format, cacheEntry);
  }

  return cacheEntry.options;
}
