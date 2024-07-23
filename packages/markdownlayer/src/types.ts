import type { Config as MarkdocConfig } from '@markdoc/markdoc';
import type { RemarkEmojiOptions } from 'remark-emoji';
import type { Options as RemarkGfmOptions } from 'remark-gfm';
import type { Options as RemarkRehypeOptions } from 'remark-rehype';
import type { PluggableList } from 'unified';
import type { AnyZodObject, ZodDiscriminatedUnion, ZodEffects, ZodIntersection, ZodUnion } from 'zod';

import type { MarkdownlayerCache } from './cache';
import type { AdmonitionPluginOptions, RemarkTransformLinksOptions } from './remark';
import type { SchemaContext } from './schemas/resolve';

type DocumentDefinitionSchemaWithoutEffects =
  | AnyZodObject
  | ZodUnion<[DocumentDefinitionSchemaWithoutEffects, ...DocumentDefinitionSchemaWithoutEffects[]]>
  | ZodDiscriminatedUnion<string, AnyZodObject[]>
  | ZodIntersection<DocumentDefinitionSchemaWithoutEffects, DocumentDefinitionSchemaWithoutEffects>;

export type DocumentDefinitionSchema =
  | DocumentDefinitionSchemaWithoutEffects
  | ZodEffects<DocumentDefinitionSchemaWithoutEffects>;

export type DocumentFormat = 'md' | 'mdx' | 'mdoc';
export type DocumentFormatInput = 'detect' | DocumentFormat;

export type GenerationMode = 'development' | 'production';

export type DocumentBody = {
  /** Format of the document */
  format: DocumentFormat;

  /** Raw file content */
  raw: string;

  /**
   * Pre-bundled react component to be rendered using the `<Markdownlayer {...} />`
   * component or various hooks imported from `markdownlayer/react`.
   * Check the examples for how to use this.
   */
  code: string;
};

// These must be formats supported by Next's Image component
export const ImageFormats = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'tiff', 'gif', 'svg'] as const;
export type ImageFormat = (typeof ImageFormats)[number];
export type ImageData = {
  src: string;
  /**
   * Alt text for the image.
   *
   * Can be provided via ...
   *   - JSON: `"myImageField": { "alt": "My alt text", "src": "my-image.jpg" }`
   *   - YAML / Frontmatter:
   *     ```yaml
   *     # ...
   *     myImageField:
   *       alt: My alt text
   *       src: my-image.jpg
   *     ```
   */
  alt?: string;
  format: ImageFormat;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
  /** `width` / `height` (see https://en.wikipedia.org/wiki/Aspect_ratio_(image)) */
  aspectRatio: number;
};

export type GitFileInfo = {
  /** Relevant commit date in ISO format. */
  date: string;

  /** Timestamp in **seconds**, as returned from git. */
  timestamp: number;

  /** The author's name, as returned from git. */
  author: string;
};

export type TocItem = {
  readonly level: number;
  readonly value: string;
  readonly id: string;
  readonly url: string;
};

export type { SchemaContext };

/** Represents the definition of a document collection. */
export type DocumentDefinition = {
  /**
   * Schema for each document in the collection.
   */
  schema: DocumentDefinitionSchema | ((context: SchemaContext) => DocumentDefinitionSchema);
};

/** Options for configuring plugins. */
export type MarkdownlayerConfigPlugins = {
  /** Options for using markdoc. */
  markdoc?: MarkdownlayerConfigMarkdoc;

  /**
   * Options for configuring the inbuilt remark-admonitions plugin.
   * - `true`: Use default options
   * - `false`: Disable the plugin
   * - `AdmonitionOptions`: Use custom options
   *
   * @default true
   */
  admonitions?: boolean | AdmonitionPluginOptions;

  /**
   * Options for configuring the plugin for [emoji](https://github.com/rhysd/remark-emoji).
   * - `true`: Use default options
   * - `false`: Disable the plugin
   * - `RemarkEmojiOptions`: Use custom options
   *
   * @default true
   */
  emoji?: boolean | RemarkEmojiOptions;

  /**
   * Options for configuring the plugin for [GitHub-flavored Markdown](https://github.com/remarkjs/remark-gfm).
   * - `true`: Use default options
   * - `false`: Disable the plugin
   * - `RemarkGfmOptions`: Use custom options
   *
   * @default true
   */
  gfm?: boolean | RemarkGfmOptions;

  /**
   * Whether to transform linked files (e.g. images and files) in a document's content to the output directory.
   * - `true`: Use default options
   * - `false`: Disable the plugin
   * - `RemarkTransformLinksOptions`: Use custom options
   *
   * @default true
   */
  transformLinks?: boolean | RemarkTransformLinksOptions;

  /** List of recma (esast, JavaScript) plugins. */
  recmaPlugins?: PluggableList | null | undefined;

  /** List of remark (mdast, markdown) plugins. */
  remarkPlugins?: PluggableList | null | undefined;

  /** List of rehype (hast, HTML) plugins. */
  rehypePlugins?: PluggableList | null | undefined;

  /** Options to pass through to `remark-rehype`. */
  remarkRehypeOptions?: RemarkRehypeOptions | null | undefined;
};

/** Options for configuring markdoc. */
export type MarkdownlayerConfigMarkdoc = {
  /**
   * Whether to allow comments.
   * @default true
   */
  allowComments?: boolean;

  /**
   * Whether to allow indentation.
   * @default true
   */
  allowIndentation?: boolean;

  /**
   * @default false
   */
  slots?: boolean;

  /**
   * Configuration for transforming the markdoc AST.
   */
  transformConfig?: MarkdocConfig;
};

/** Options for configuring the output. */
export type MarkdownlayerConfigOutput = {
  /**
   * The directory of the assets (relative to config file), where to write the output assets.
   * @default 'public/static'
   */
  assets: string;

  /**
   * The public base path of the assets
   * @default '/static/'
   * @example
   * '/' -> '/image.png'
   * '/static/' -> '/static/image.png'
   * './static/' -> './static/image.png'
   */
  base: '/' | `/${string}/` | `.${string}/`;

  /**
   * This option determines the name format of each output asset.
   * The asset will be written to the directory specified in the `output.assets` option.
   * You can use `[name]`, `[hash]` and `[ext]` template strings with specify length.
   * @default '[name]-[hash:8].[ext]'
   */
  format: string;
};

export type DocumentDefinitions = { [type: string]: DocumentDefinition };

export type MarkdownlayerConfig<T extends DocumentDefinitions = DocumentDefinitions> = {
  /**
   * Whether to cache the generated documents.
   * This is useful for development mode to speed up HMR.
   * It has no effect in production mode.
   *
   * You may want to disable caching when you are developing code in this markdownlayer
   * library and want to see fast changes.
   *
   * @default true
   */
  caching?: boolean;

  /**
   * Path to root directory that contains all content (relative to config file).
   * @default 'content'
   */
  contentDirPath?: string;

  /**
   * Glob patterns to match documents, relative to `contentDirPath`.
   *
   * @description
   * See the supported [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns)
   *
   * @default '**\/*.{md,mdx,mdoc}'
   */
  patterns?: string | readonly string[];

  /**
   * Definitions of documents to generate.
   * The key is the type of the document and should match your documents directory name in `contentDirPath`.
   */
  definitions: T;

  /** Output configuration */
  output?: MarkdownlayerConfigOutput;
} & MarkdownlayerConfigPlugins;

/** Define a schema (identity function for type inference and convenience) */
export const defineSchema = <T extends (context: SchemaContext) => DocumentDefinitionSchema>(fn: T): T => fn;

/** Define config (identity function for type inference and convenience) */
export const defineConfig = <T extends DocumentDefinitions>(config: MarkdownlayerConfig<T>): MarkdownlayerConfig<T> =>
  config;

/** Represents the result of getting the configuration. */
export type ResolvedConfig = MarkdownlayerConfig & {
  /** The mode of the generation. */
  readonly mode: GenerationMode;

  /** The path to the configuration file. */
  readonly configPath: string;

  /**
   * The hash of the configuration.
   * This is used to determine if the configuration has changed.
   */
  readonly configHash: string;

  /** Dependencies of the config file. */
  readonly configImports: string[];

  /** Global cache */
  readonly cache: MarkdownlayerCache;

  /** Path to root directory that contains all content (relative to config file). */
  readonly contentDirPath: string;

  /** Glob patterns to match documents, relative to `contentDirPath`. */
  readonly patterns: string | readonly string[];

  /** Output configuration */
  readonly output: MarkdownlayerConfigOutput & {
    /** Path to directory that contains all generated files (relative to config file). */
    readonly generated: string;
  };
};
