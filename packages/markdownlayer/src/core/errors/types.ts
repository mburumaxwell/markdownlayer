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
