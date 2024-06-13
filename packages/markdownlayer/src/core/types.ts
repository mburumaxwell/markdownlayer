import type { Config as MarkdocConfig } from '@markdoc/markdoc';
import type { ReadTimeResults } from 'reading-time';
import type { Options as RemarkRehypeOptions } from 'remark-rehype';
import type { PluggableList } from 'unified';
import type {
  AnyZodObject,
  ZodDiscriminatedUnion,
  ZodEffects,
  ZodIntersection,
  ZodLiteral,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodString,
  ZodUnion,
} from 'zod';

import type { AdmonitionPluginOptions } from '@/remark';

// This needs to be in sync with StaticImageData
export type StaticImageDataSchema = ZodObject<{
  src: ZodString;
  height: ZodNumber;
  width: ZodNumber;
  blurDataURL: ZodOptional<ZodString>;
  blurWidth: ZodOptional<ZodNumber>;
  blurHeight: ZodOptional<ZodNumber>;
  format: ZodOptional<
    ZodUnion<
      [
        ZodLiteral<'png'>,
        ZodLiteral<'jpg'>,
        ZodLiteral<'jpeg'>,
        ZodLiteral<'tiff'>,
        ZodLiteral<'webp'>,
        ZodLiteral<'gif'>,
        ZodLiteral<'svg'>,
        ZodLiteral<'avif'>,
      ]
    >
  >;
}>;

/**
 * Schema for an image.
 * @param optional Whether the image is optional.
 * @returns A Zod object representing an image.
 */
export type ImageSchemaFunction = (optional?: boolean) => StaticImageDataSchema;

type DocumentDefinitionSchemaWithoutEffects =
  | AnyZodObject
  | ZodUnion<[DocumentDefinitionSchemaWithoutEffects, ...DocumentDefinitionSchemaWithoutEffects[]]>
  | ZodDiscriminatedUnion<string, AnyZodObject[]>
  | ZodIntersection<DocumentDefinitionSchemaWithoutEffects, DocumentDefinitionSchemaWithoutEffects>;

export type DocumentDefinitionSchema =
  | DocumentDefinitionSchemaWithoutEffects
  | ZodEffects<DocumentDefinitionSchemaWithoutEffects>;

export type SchemaContext = { image: ImageSchemaFunction };

export type DocumentGitLastUpdated = {
  /** Relevant commit date. */
  date?: Date;
  /** Names of authors, as returned from git. Latest first */
  authors?: string[];
};

export type DocumentFormat = 'md' | 'mdx' | 'mdoc';
export type DocumentFormatInput = 'detect' | DocumentFormat;

export type GenerationMode = 'development' | 'production';

export type DocumentBody = {
  /** Raw file content */
  raw: string;

  /**
   * Pre-bundled react component to be rendered using hooks imported from `markdownlayer/hooks`.
   * Check the examples for how to use this.
   */
  code: string;
};

export type DocumentMeta = {
  _id: string;
  _filePath: string;

  type: string;

  /** Frontmatter of the document. */
  frontmatter: Record<string, unknown>;

  /**
   * Git commit information.
   * This only populates in production mode and when `lastUpdatedFromGit` is enabled.
   */
  git?: DocumentGitLastUpdated;

  /** File format */
  format: DocumentFormat;

  /** File body */
  body: DocumentBody;

  /** Reading time of the document */
  readingTime?: ReadTimeResults;

  /**
   * Slug of the document relative to the content directory i.e. `{contentDirPath}/{type}`.
   *
   * @description This value can be overridden by setting `slug` in frontmatter.
   *
   * @example
   * For when `contentDirPath` is set to `/src/content`, a definition named `posts` is defined,
   * and there is a file at `/src/content/posts/my-first-post.md`, the slug will be `my-first-post`.
   */
  slug: string;
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
  tableOfContents?: TocItem[];
};

export interface DocumentDefinition {
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
   * Schema for each document in the collection.
   */
  schema?: DocumentDefinitionSchema | ((context: SchemaContext) => DocumentDefinitionSchema);

  /**
   * Whether to use last update information from git commit history in production mode.
   * Only author and last updated time can be pulled from Git.
   *
   * This will only work if the git history is available.
   * Values can be overridden by setting `updated` in frontmatter.
   * You may want to adjust your schema to include `updated` with type `string`. or `date`. For example:
   * ```ts
   * updated: z.string().optional()
   * ```
   * or
   * ```ts
   * updated: z.coerce.date().optional()
   * ```
   *
   * @default true
   */
  lastUpdatedFromGit?: boolean;

  /**
   * Whether to use author from git commit history when author is not specified in frontmatter.
   *
   * This will only work if `lastUpdatedFromGit` is set to `true`.
   * Values can be overridden by setting `authors` or `author` in frontmatter.
   * You may also want to adjust your schema to include `authors` with type `string[]` or `author` with type `string`. For example:
   * ```ts
   * authors: z.string().array()
   * author: z.string()
   * ```
   *
   * @default false
   */
  authorFromGit?: boolean; // TODO: rename to authorsFromGit once we can pull all the authors from commit history

  /**
   * Whether to generate a table of contents for the documents.
   *
   * @default false
   */
  toc?: boolean;

  /**
   * Validate the document. (optional)
   * You can use `sharp` here to ensure the image in metadata has correct dimensions.
   * This will be removed once the library has proper image processing support.
   * @param document The document to validate
   */
  validate?: (document: BaseDoc) => Promise<void>;
}

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

  /** List of recma (esast, JavaScript) plugins. */
  recmaPlugins?: PluggableList | null | undefined;

  /** List of remark (mdast, markdown) plugins. */
  remarkPlugins?: PluggableList | null | undefined;

  /** List of rehype (hast, HTML) plugins. */
  rehypePlugins?: PluggableList | null | undefined;

  /** Options to pass through to `remark-rehype`. */
  remarkRehypeOptions?: RemarkRehypeOptions | null | undefined;
};

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

export type MarkdownlayerConfig = {
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
   * Path to root directory that contains all content.
   * Every content file path will be relative to this directory including the `patterns` field.
   */
  contentDirPath: string;

  /**
   * Glob patterns to match documents, relative to `contentDirPath`.
   * @default '**\/*.{md,mdx,mdoc}'
   *
   * See the supported [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns)
   */
  patterns?: string | readonly string[];

  /**
   * Definitions of documents to generate.
   * The key is the type of the document and should match your documents directory name in `contentDirPath`.
   */
  definitions: Record<string, DocumentDefinition>;

  /**
   * Whether to use mdoc for `.md` files instead of mdx.
   * This is useful for when you want to use mdx for `.mdx` files but not for `.md` files.
   *
   * @default false
   */
  mdAsMarkdoc?: boolean;
} & MarkdownlayerConfigPlugins;
