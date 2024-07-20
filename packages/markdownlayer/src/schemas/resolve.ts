import type { DocumentDefinition, ResolvedConfig } from '../types';
import { type BodyParams, body } from './body';
import { type GitParams, git } from './git';
import { type IdOptions, id } from './id';
import { type ImageParams, image } from './image';
import { type ReadingTimeParams, readtime } from './read-time';
import { type SlugParams, slug } from './slug';
import { toc } from './toc';

export type SchemaContext = {
  /**
   * Schema for a document's body.
   * @param params - Params for the body schema.
   * @returns A Zod object representing a document body.
   */
  body: (params?: BodyParams) => ReturnType<typeof body>;

  /**
   * Schema for a file's git file info.
   *
   * @description
   * It gets the commit date instead of author date so that amended commits
   * can have their dates updated.
   *
   * @param params - Params for the git schema.
   * @returns A Zod object representing git file info.
   */
  git: (params?: GitParams) => ReturnType<typeof git>;

  /**
   * Schema for a document's id.
   * @param params - Params for the id schema.
   * @returns A Zod object representing a document's id.
   */
  id: (params?: IdOptions) => ReturnType<typeof id>;

  /**
   * Schema for an image.
   * @param params - Params for the image schema.
   * @returns A Zod object representing an image.
   */
  image: (params?: ImageParams) => ReturnType<typeof image>;

  /**
   * Schema for a document's reading time.
   * @param params - Params for the reading time schema.
   * @returns A Zod object representing reading time data.
   */
  readtime: (params?: ReadingTimeParams) => ReturnType<typeof readtime>;

  /**
   * Schema for a document's slug.
   * @param params - Params for the slug schema.
   * @returns A Zod object representing a document's slug.
   */
  slug: (params?: SlugParams) => ReturnType<typeof slug>;

  /**
   * Schema for a document's table of contents.
   * @returns A Zod object representing table of contents data.
   */
  toc: () => ReturnType<typeof toc>;
};

export type ResolveSchemaOptions = Pick<DocumentDefinition, 'schema'> & {
  config: ResolvedConfig;
  /** Type of definition */
  type: string;
  path: string;
  contents: string;
  frontmatter: Record<string, unknown>;
};

export function resolveSchema({
  type,
  schema,

  path,
  contents,

  frontmatter,
  config,
}: ResolveSchemaOptions) {
  if (typeof schema === 'function') {
    schema = schema({
      body: (params: BodyParams = {}) => body({ ...params, path, contents, frontmatter, config }),
      git: (params: GitParams = {}) => git({ ...params, path }),
      id: (params: IdOptions = {}) => id({ ...params, type, path, config }),
      image: (params: ImageParams = {}) => image({ ...params, path, config }),
      readtime: (params: ReadingTimeParams = {}) => readtime({ ...params, contents }),
      slug: (params: SlugParams = {}) => slug({ ...params, type, path, config }),
      toc: () => toc({ contents }),
    });
  }

  return schema;
}
