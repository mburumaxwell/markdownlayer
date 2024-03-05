export class NoConfigFoundError extends Error {
  constructor({ configPath, cwd }: { readonly configPath?: string; readonly cwd: string }) {
    super(
      configPath
        ? `Couldn't find ${configPath}`
        : `Could not find markdownlayer.config.ts or markdownlayer.config.js in ${cwd}. Create one or pass the config in the 'withMarkdownlayer' function.`,
    );
  }
}

export class ConfigReadError extends Error {
  constructor({ configPath, error }: { readonly configPath: string; readonly error: Error }) {
    super(`ConfigReadError (${configPath}): ${errorToString(error)}`);
  }
}

export class ConfigNoDefaultExportError extends Error {
  constructor({ configPath, availableExports }: { readonly configPath: string; readonly availableExports: string[] }) {
    super(`ConfigNoDefaultExportError (${configPath}): Available exports: ${availableExports.join(', ')}`);
  }
}

export const errorToString = (error: any) => {
  const stack = process.env.CL_DEBUG ? error.stack : undefined;
  const str = error.toString();
  const stackStr = stack ? `\n${stack}` : '';
  if (str !== '[object Object]') return str + stackStr;

  return JSON.stringify({ ...error, stack }, null, 2);
};
