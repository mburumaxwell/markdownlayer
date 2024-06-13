import type { ZodError } from 'zod';

export interface ErrorData {
  name: string;
  title: string;
  message?: string | ((...params: never) => string);
}

/**
 * @docs
 * @message Could not find markdownlayer.config.ts or markdownlayer.config.js
 * @description
 * Config file must be provided or passed in the `withMarkdownlayer` function.
 */
export const NoConfigFoundError = {
  name: 'NoConfigFoundError',
  title: 'No config file found.',
  message({ configPath, cwd }: { readonly configPath?: string; readonly cwd: string }) {
    return configPath
      ? `Couldn't find ${configPath}`
      : `Could not find markdownlayer.config.ts or markdownlayer.config.js in ${cwd}. Create one or pass the config in the 'withMarkdownlayer' function.`;
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
 * @message Config contains more than one definition with the same name: `NAME`. Names must be unique.
 * @description
 * Duplicate definition types found
 */
export const DuplicateDefinitionNameError = {
  name: 'DuplicateDefinitionNameError',
  title: 'Duplicate definition name found',
  message({ names }: { readonly names: string[] }) {
    return `Duplicate definition types found in config file: ${names.join(', ')}.`;
  },
} satisfies ErrorData;

/**
 * @docs
 * @message Definitions with no patterns found: `NAMES`
 * @description
 * Definitions with no patterns found
 */
export const DefinitionsWithNoPatternsError = {
  name: 'DefinitionsWithNoPatternsError',
  title: 'Definitions with no patterns found.',
  message({ names }: { readonly names: string[] }) {
    return `Definitions with no patterns found: ${names.join(', ')}.`;
  },
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
