import type { ZodError } from 'zod';
import type { GenerationMode } from '../types';

export interface ErrorData {
  name: string;
  title: string;
  message?: string | ((...params: never) => string);
}

/**
 * @docs
 * @message Invalid generation mode. Accepted values are 'development' or 'production'.
 * @description
 * The generation mode must be either 'development' or 'production'.
 */
export const InvalidGenerationModeError = {
  name: 'InvalidGenerationModeError',
  title: 'Invalid generation mode.',
  message({ mode }: { readonly mode: GenerationMode }) {
    return `Invalid generation mode: ${mode}. Accepted values are 'development' or 'production'.`;
  },
} satisfies ErrorData;

/**
 * @docs
 * @message Could not find markdownlayer.config.ts
 * @description
 * Config file must be provided .
 */
export const NoConfigFoundError = {
  name: 'NoConfigFoundError',
  title: 'No config file found.',
  message({ configPath }: { readonly configPath?: string }) {
    return configPath ? `Couldn't find ${configPath}` : `Could not find markdownlayer.config.ts.`;
  },
} satisfies ErrorData;

/**
 * @docs
 * @message ConfigNoDefaultExportError (`CONFIG_PATH`): Available exports: ...
 * @description
 * The config file must have a default export.
 */
export const ConfigNoDefaultExportError = {
  name: 'ConfigNoDefaultExportError',
  title: 'Config file does not have a default export.',
  message({ configPath, availableExports }: { readonly configPath: string; readonly availableExports: string[] }) {
    return `ConfigNoDefaultExportError (${configPath}): Available exports: ${availableExports.join(', ')}`;
  },
} satisfies ErrorData;

/**
 * @docs
 * @message ConfigNoDefinitionsError (`CONFIG_PATH`): 'definitions' is required in the config file
 * @description
 * The config must have a `definitions` field.
 */
export const ConfigNoDefinitionsError = {
  name: 'ConfigNoDefinitionsError',
  title: 'Config does not have a definitions field',
  message({ configPath }: { readonly configPath: string }) {
    return `ConfigNoDefinitionsError (${configPath}): 'definitions' is required in the config file`;
  },
} satisfies ErrorData;

/**
 * @docs
 * @message `DEFINITION_NAME` contains multiple documents with the same slug: `SLUG`. Slugs must be unique.
 * @description
 * Error reading config file.
 */
export const ConfigReadError = {
  name: 'ConfigReadError',
  title: 'Error reading config file.',
  message({ configPath, error }: { readonly configPath: string; readonly error: Error }) {
    return `ConfigReadError ${configPath}: ${error.message}`;
  },
} satisfies ErrorData;

/**
 * @docs
 * @message No patterns found specified in the config.
 * @description
 * Config file must have a non-null`patterns` field.
 */
export const ConfigNoPatternsError = {
  name: 'ConfigNoPatternsError',
  title: 'No patterns found in the config.',
  message: 'Config file must have a non-null `patterns` field.',
} satisfies ErrorData;

/**
 * @docs
 * @message
 * **Example error message:**<br/>
 * **blog** → **post.md** frontmatter does not match definition schema.<br/>
 * "title" is required.<br/>
 * "date" must be a valid date.
 * @description
 * A document in `src/content/` does not match its definition schema.
 * Make sure that all required fields are present, and that all fields are of the correct type.
 * You can check against the definition schema in your `src/content/config.*` file.
 */
export const InvalidDocumentFrontmatterError = {
  name: 'InvalidDocumentFrontmatterError',
  title: 'Document frontmatter does not match schema.',
  message({ definition, documentId, error }: { definition: string; documentId: string; error: ZodError }) {
    return [
      `**${String(definition)} → ${String(documentId)}** frontmatter does not match definition schema.`,
      ...error.errors.map((zodError) => zodError.message),
    ].join('\n');
  },
} satisfies ErrorData;

/**
 * @docs
 * @description
 * A definition schema should not contain the `slug` field. This is reserved by for generating document slugs. Remove `slug` from your schema. You can still use custom slugs in your frontmatter.
 */
export const DefinitionSchemaContainsSlugError = {
  name: 'DefinitionSchemaContainsSlugError',
  title: 'Definition Schema should not contain `slug`.',
  message: ({ definition }: { readonly definition: string }) =>
    `A definition schema should not contain \`slug\` since it is reserved for slug generation. Remove this from your ${definition} definition schema.`,
} satisfies ErrorData;

/**
 * @docs
 * @message `DEFINITION_NAME` contains multiple documents with the same slug: `SLUG`. Slugs must be unique.
 * @description
 * Documents must have unique slugs. Duplicates are often caused by the `slug` frontmatter property.
 */
export const DuplicateDocumentSlugError = {
  name: 'DuplicateDocumentSlugError',
  title: 'Duplicate document slug.',
  message({
    definition,
    slugs,
    documents,
  }: {
    readonly definition: string;
    readonly slugs: string[];
    readonly documents: string[];
  }) {
    return (
      `**${definition}** contains multiple documents with the same slug. Slugs must be unique.\n\n` +
      `Slugs:\n` +
      `${slugs.map((slug) => `- ${slug}`).join('\n')}\n\n` +
      `Documents: \n` +
      `${documents.map((doc) => `- ${doc}`).join('\n')}`
    );
  },
} satisfies ErrorData;
