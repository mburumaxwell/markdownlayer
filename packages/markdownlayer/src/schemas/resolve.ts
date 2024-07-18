import type { DocumentDefinition, MarkdownlayerConfigPlugins, ResolvedConfig } from '../types';
import { body } from './body';
import { type GitParams, git } from './git';
import { id } from './id';
import { type ImageOptions, image } from './image';
import { type ReadingTimeParams, readtime } from './read-time';
import { type SlugParams, slug } from './slug';
import { toc } from './toc';

export type SchemaContext = {
  /**
   * Schema for a document's body.
   * @returns A Zod object representing a document body.
   */
  body: () => ReturnType<typeof body>;

  /**
   * Schema for a file's git file info.
   *
   * @description
   * It gets the commit date instead of author date so that amended commits
   * can have their dates updated.
   *
   * @param param - Options for the git file info schema.
   * @returns A Zod object representing git file info.
   */
  git: (params?: GitParams) => ReturnType<typeof git>;

  /**
   * Schema for a document's id.
   * @returns A Zod object representing a document's id.
   */
  id: () => ReturnType<typeof id>;

  /**
   * Schema for an image.
   * @param options - Options for the image schema.
   * @returns A Zod object representing an image.
   */
  image: (params?: ImageOptions) => ReturnType<typeof image>;

  /**
   * Schema for a document's reading time.
   * @param params - Options for the reading time schema.
   * @returns A Zod object representing reading time data.
   */
  readtime: (params?: ReadingTimeParams) => ReturnType<typeof readtime>;

  /**
   * Schema for a document's slug.
   * @param params - Options for the slug schema.
   * @returns A Zod object representing a document's slug.
   */
  slug: (params?: SlugParams) => ReturnType<typeof slug>;

  /**
   * Schema for a document's table of contents.
   * @returns A Zod object representing table of contents data.
   */
  toc: () => ReturnType<typeof toc>;
};

export type ResolveSchemaOptions = Pick<ResolvedConfig, 'mdAsMarkdoc' | 'cache' | 'output'> &
  Pick<DocumentDefinition, 'format' | 'schema'> & {
    /** Type of definition */
    type: string;
    relativePath: string;
    path: string;
    contents: string;

    frontmatter: Record<string, unknown>;
    plugins: MarkdownlayerConfigPlugins;
  };

export function resolveSchema({
  type,
  relativePath,
  path,
  contents,
  schema,
  output,
  cache,
  format,
  mdAsMarkdoc,
  frontmatter,
  plugins,
}: ResolveSchemaOptions) {
  if (typeof schema === 'function') {
    schema = schema({
      body: () => body({ contents, path, output, format, mdAsMarkdoc, frontmatter, plugins }),
      git: (params: GitParams = {}) => git({ ...params, path }),
      id: () => id({ type, relativePath, path, cache }),
      image: (params: ImageOptions = {}) => image({ ...params, path, output }),
      readtime: (params: ReadingTimeParams = {}) => readtime({ ...params, contents }),
      slug: (params: SlugParams = {}) => slug({ ...params, type, relativePath, path, cache }),
      toc: () => toc({ contents }),
    });
  }

  return schema;
}
