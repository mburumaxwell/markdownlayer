import type { Config as MarkdocConfig } from '@markdoc/markdoc';
import type { ReadTimeResults } from 'reading-time';
import type { Options as RemarkRehypeOptions } from 'remark-rehype';
import type { PluggableList } from 'unified';

import type { AdmonitionPluginOptions } from '@/remark';

export type DocumentData = {
  /** Relative to `contentDirPath` */
  sourceFilePath: string;
  sourceFileName: string;
  /** Relative to `contentDirPath` */
  sourceFileDir: string;
  /** A path e.g. useful as URL paths based on `sourceFilePath` with file extension removed and `/index` removed. */
  flattenedPath: string;
  /** Frontmatter of the document. */
  frontmatter: Record<string, unknown>;
};

export type DocumentFormat = 'md' | 'mdx' | 'mdoc';
export type DocumentFormatInput = 'detect' | DocumentFormat;

export type GenerationMode = 'development' | 'production';

export type DocumentBody = {
  /** Raw file content */
  raw: string;

  /** Pre-bundled with mdx-bundler */
  code: string;
};

export type DocumentMeta = {
  _id: string;
  _raw: DocumentData;

  /** File format */
  format: DocumentFormat;

  /** File body */
  body: DocumentBody;
};

export type ImageData = {
  /** Image file path relative to `contentDirPath` */
  filePath: string;

  /** Image file path relative to document */
  relativeFilePath: string;
  width: number;
  height: number;
  /** `width` / `height` (see https://en.wikipedia.org/wiki/Aspect_ratio_(image)) */
  aspectRatio: number;
  format: 'png' | 'jpg' | 'jpeg' | 'webp' | 'avif';
  blurHashDataUrl: string;
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
};

export type TocItem = {
  readonly level: number;
  readonly value: string;
  readonly id: string;
  readonly url: string;
};

export type BaseDoc = DocumentMeta & {
  type: string;
  title: string;
  keywords: string[] | undefined;
  authors: string[];
  slug: string;
  published: string;
  updated: string;
  readingTime?: ReadTimeResults;
  draft: boolean;
  unlisted: boolean;

  /** Short description that is used for SEO, in RSS/ATOM feed, and in some subtitles */
  description?: string | undefined;

  sidebarLabel?: string | undefined;
  paginationLabel?: string | undefined;
  image?: string | undefined;
  tableOfContents?: TocItem[];

  /** Link for more information about the changelog such as docs or blog */
  link?: string | URL | undefined;
  category?: 'billing' | 'identity' | 'payments' | 'messaging' | 'development' | 'mobile' | undefined;
};

export interface DocumentDefinition {
  /**
   * Unique identifier for the document type.
   * This is also the name of the document type.
   */
  type: string;

  /**
   * Format of contents of the files
   * - `detect`: Detects the format based on the file extension
   * - `md`: Markdown
   * - `mdx`: Markdown with JSX
   *
   * @default 'detect'
   */
  format?: DocumentFormatInput;

  /**
   * Glob patterns to match documents, relative to the `contentDirPath` config
   *
   * See the supported [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns)
   */
  patterns: string | readonly string[];

  /** Whether to use author from git commit history when author is not specified in frontmatter. */
  authorFromGit?: boolean;

  /** Whether to generate a table of contents for the documents. */
  toc?: boolean;

  /**
   * Validate the document. (optional)
   * You can use `zod` here to ensure each document has the required shape.
   * @param document The document to validate
   */
  validate?: (document: BaseDoc) => void;
}

export type MarkdownerConfigPlugins = {
  /** Options for using markdoc. */
  markdoc?: MarkdownerConfigMarkdoc;

  /**
   * Options for configuring the inbuilt remark-admonitions plugin.
   * - `true`: Use default options
   * - `false`: Disable the plugin
   * - `AdmonitionOptions`: Use custom options
   *
   * @default true
   */
  admonitions?: boolean | AdmonitionPluginOptions;

  /** List of recma (esast, JavaScript) plugins. */
  recmaPlugins?: PluggableList | null | undefined;

  /** List of remark (mdast, markdown) plugins. */
  remarkPlugins?: PluggableList | null | undefined;

  /** List of rehype (hast, HTML) plugins. */
  rehypePlugins?: PluggableList | null | undefined;

  /** Options to pass through to `remark-rehype`. */
  remarkRehypeOptions?: RemarkRehypeOptions | null | undefined;
};

export type MarkdownerConfigMarkdoc = {
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

export type MarkdownerConfig = {
  /**
   * Whether to cache the generated documents.
   * This is useful for development mode to speed up HMR.
   * It has no effect in production mode.
   *
   * You may want to disable caching when you are developing code in this markdowner
   * library and want to see fast changes.
   *
   * @default true
   */
  caching?: boolean;

  /**
   * Path to root directory that contains all content.
   * Every content file path will be relative to this directory.
   * This includes:
   * - The `patterns` field of each document in `documents` is relative to `contentDirPath`
   * - Each document`s `_raw` fields such as ``flattenedPath`, `sourceFilePath`, and `sourceFileDir`
   */
  contentDirPath: string;

  /**
   * Definitions of documents to generate.
   */
  definitions: DocumentDefinition[];

  /**
   * Whether to use mdoc for `.md` files instead of mdx.
   * This is useful for when you want to use mdx for `.mdx` files but not for `.md` files.
   *
   * @default false
   */
  mdAsMarkdoc?: boolean;
} & MarkdownerConfigPlugins;
