import { globalExternals } from '@fal-works/esbuild-plugin-global-externals';
import Markdoc, { type Config as MarkdocConfig } from '@markdoc/markdoc';
import type { Options as CompileOptions } from '@mdx-js/esbuild';
import mdxESBuild from '@mdx-js/esbuild';
import type { BuildOptions, Plugin } from 'esbuild';
import esbuild, { type Message } from 'esbuild';
import rehypeRaw, { type Options as RehypeRawOptions } from 'rehype-raw';
import remarkDirective from 'remark-directive';
import remarkEmoji from 'remark-emoji';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import type { Pluggable, PluggableList } from 'unified';

import { remarkAdmonitions, remarkHeadings, remarkTransformImages, remarkTransformLinks } from './remark';
import type { DocumentFormat, ResolvedMarkdownlayerConfig } from './types';

export type BundleProps = {
  config: ResolvedMarkdownlayerConfig;
  path: string;
  contents: string;
  format: DocumentFormat;
  frontmatter: Record<string, unknown>;
};

export type BundleResult = { code: string; errors: Message[] };
export async function bundle({ format, config, ...options }: BundleProps): Promise<BundleResult> {
  switch (format) {
    case 'md':
    case 'mdx':
      return await mdx({ config, format, ...options });
    case 'mdoc':
      return await mdoc({ config, ...options });

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

type BundleMdocProps = Pick<BundleProps, 'config' | 'contents' | 'frontmatter'>;
async function mdoc({ config: { markdoc }, contents, frontmatter }: BundleMdocProps): Promise<BundleResult> {
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

type BundleMdxProps = Pick<BundleProps, 'config' | 'path' | 'contents'> & { format: 'md' | 'mdx' };
async function mdx({ config, path, contents, format }: BundleMdxProps): Promise<BundleResult> {
  const inMemoryPlugin: Plugin = {
    name: 'in-memory-plugin',
    setup(build) {
      build.onResolve({ filter: /.*/ }, ({ path: filePath }) => {
        if (filePath === path) {
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

  const {
    admonitions = true,
    emoji = true,
    gfm = true,
    transformImages = true,
    transformLinks = true,
    recmaPlugins,
    remarkPlugins,
    rehypePlugins,
    remarkRehypeOptions,
  } = config;

  const compileOptions: CompileOptions = {
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
      ...((gfm ? [gfm === true ? remarkGfm : [remarkGfm, gfm]] : []) as PluggableList),
      ...((transformImages
        ? [[remarkTransformImages, transformImages === true ? { config } : { config, ...transformImages }]]
        : []) as PluggableList),
      ...((transformLinks
        ? [[remarkTransformLinks, transformLinks === true ? { config } : { config, ...transformLinks }]]
        : []) as PluggableList),

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
    compileOptions.rehypePlugins!.unshift(rehypeRawPlugin);
  }

  const buildOptions: BuildOptions = {
    entryPoints: [path],
    write: false,
    bundle: true,
    target: 'es2020',
    format: 'iife',
    globalName: 'Component',
    treeShaking: false,
    splitting: false,
    minify: false, // let the bundling framework handle the minification
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
  const code = bundled.outputFiles![0].text;

  return {
    code: `${code};return Component;`,
    errors: bundled.errors,
  };
}
