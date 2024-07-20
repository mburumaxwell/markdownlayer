import type { ZodError } from 'zod';

export function getYamlErrorLine(rawData: string | undefined, objectKey: string) {
  if (!rawData) return 0;
  const indexOfObjectKey = rawData.search(
    // Match key either at the top of the file or after a newline
    // Ensures matching on top-level object keys only
    new RegExp(`(\n|^)${objectKey}`),
  );
  if (indexOfObjectKey === -1) return 0;

  const dataBeforeKey = rawData.substring(0, indexOfObjectKey + 1);
  const numNewlinesBeforeKey = dataBeforeKey.split('\n').length;
  return numNewlinesBeforeKey;
}

interface ErrorProperties {
  title?: string;
  name: string;
  message?: string;
  location?: ErrorLocation;
  hint?: string;
  stack?: string;
  frame?: string;
}

export interface ErrorLocation {
  file?: string;
  line?: number;
  column?: number;
}

type ErrorTypes =
  | 'MarkdownlayerError'
  | 'NoConfigFoundError'
  | 'ConfigReadError'
  | 'ConfigNoDefaultExportError'
  | 'ConfigNoDefinitionsError';

export function isMarkdownlayerError(e: unknown): e is MarkdownlayerError {
  return e instanceof MarkdownlayerError;
}

export class MarkdownlayerError extends Error {
  public loc: ErrorLocation | undefined;
  public title: string | undefined;
  public hint: string | undefined;
  public frame: string | undefined;

  type: ErrorTypes = 'MarkdownlayerError';

  constructor(props: ErrorProperties, options?: ErrorOptions) {
    const { name, title, message, stack, location, hint, frame } = props;
    super(message, options);

    this.title = title;
    this.name = name;

    if (message) this.message = message;
    // Only set this if we actually have a stack passed, otherwise uses Error's
    this.stack = stack ? stack : this.stack;
    this.loc = location;
    this.hint = hint;
    this.frame = frame;
  }

  public setLocation(location: ErrorLocation): void {
    this.loc = location;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setMessage(message: string): void {
    this.message = message;
  }

  public setHint(hint: string): void {
    this.hint = hint;
  }

  static is(err: unknown): err is MarkdownlayerError {
    return (err as MarkdownlayerError).type === 'MarkdownlayerError';
  }
}

export class NoConfigFoundError extends MarkdownlayerError {
  type: ErrorTypes = 'NoConfigFoundError';

  constructor(props: ErrorProperties, options?: ErrorOptions) {
    super(props, options);
  }

  static is(err: unknown): err is NoConfigFoundError {
    return (err as NoConfigFoundError).type === 'NoConfigFoundError';
  }
}

export class ConfigReadError extends MarkdownlayerError {
  type: ErrorTypes = 'ConfigReadError';

  constructor(props: ErrorProperties, options?: ErrorOptions) {
    super(props, options);
  }

  static is(err: unknown): err is ConfigReadError {
    return (err as ConfigReadError).type === 'ConfigReadError';
  }
}

export class ConfigNoDefaultExportError extends MarkdownlayerError {
  type: ErrorTypes = 'ConfigNoDefaultExportError';

  constructor(props: ErrorProperties, options?: ErrorOptions) {
    super(props, options);
  }

  static is(err: unknown): err is ConfigNoDefaultExportError {
    return (err as ConfigNoDefaultExportError).type === 'ConfigNoDefaultExportError';
  }
}

export class ConfigNoDefinitionsError extends MarkdownlayerError {
  type: ErrorTypes = 'ConfigNoDefinitionsError';

  constructor(props: ErrorProperties, options?: ErrorOptions) {
    super(props, options);
  }

  static is(err: unknown): err is ConfigNoDefinitionsError {
    return (err as ConfigNoDefinitionsError).type === 'ConfigNoDefinitionsError';
  }
}

interface ErrorData {
  name: string;
  title: string;
  message?: string | ((...params: never) => string);
}

export const MarkdownlayerErrorData = {
  /**
   * @docs
   * @message Could not find markdownlayer.config.ts
   * @description
   * Config file must be provided .
   */
  NoConfigFoundError: {
    name: 'NoConfigFoundError',
    title: 'No config file found.',
    message({ path }: { readonly path?: string }) {
      return path ? `Couldn't find ${path}` : `Could not find markdownlayer.config.ts.`;
    },
  },

  /**
   * @docs
   * @message ConfigNoDefaultExportError (`CONFIG_PATH`): Available exports: ...
   * @description
   * The config file must have a default export.
   */
  ConfigNoDefaultExportError: {
    name: 'ConfigNoDefaultExportError',
    title: 'Config file does not have a default export.',
    message({ path, availableExports }: { readonly path: string; readonly availableExports: string[] }) {
      return `ConfigNoDefaultExportError (${path}): Available exports: ${availableExports.join(', ')}`;
    },
  },

  /**
   * @docs
   * @message ConfigNoDefinitionsError (`CONFIG_PATH`): 'definitions' is required in the config file
   * @description
   * The config must have a `definitions` field.
   */
  ConfigNoDefinitionsError: {
    name: 'ConfigNoDefinitionsError',
    title: 'Config does not have a definitions field',
    message({ path }: { readonly path: string }) {
      return `ConfigNoDefinitionsError (${path}): 'definitions' is required in the config file`;
    },
  },

  /**
   * @docs
   * @message `DEFINITION_NAME` contains multiple documents with the same slug: `SLUG`. Slugs must be unique.
   * @description
   * Error reading config file.
   */
  ConfigReadError: {
    name: 'ConfigReadError',
    title: 'Error reading config file.',
    message({ path, error }: { readonly path: string; readonly error: Error }) {
      return `ConfigReadError ${path}: ${error.message}`;
    },
  },

  /**
   * @docs
   * @message No patterns found specified in the config.
   * @description
   * Config file must have a non-null`patterns` field.
   */
  ConfigNoPatternsError: {
    name: 'ConfigNoPatternsError',
    title: 'No patterns found in the config.',
    message: 'Config file must have a non-null `patterns` field.',
  },

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
  InvalidDocumentFrontmatterError: {
    name: 'InvalidDocumentFrontmatterError',
    title: 'Document frontmatter does not match schema.',
    message({ definition, path, error }: { definition: string; path: string; error: ZodError }) {
      return [
        `**${String(definition)} → ${String(path)}** frontmatter does not match definition schema.`,
        ...error.errors.map((zodError) => zodError.message),
      ].join('\n');
    },
  },
} satisfies Record<string, ErrorData>;
