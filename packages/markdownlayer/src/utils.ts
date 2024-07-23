import { pluralize, singularize } from 'inflection';

// https://github.com/sindresorhus/is-absolute-url/blob/main/index.js
const ABS_URL_RE = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
const ABS_PATH_RE = /^(\/[^/\\]|[a-zA-Z]:\\)/;

export function getDataVariableName(type: string): string {
  return 'all' + pluralize(toPascalCase(type));
}

export function generateTypeName(type: string): string {
  return singularize(toPascalCase(type));
}

function toPascalCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9]+/g, ' ') // Replace non-alphanumeric characters with spaces
    .split(' ') // Split the string by spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word and join them
    .join('');
}

/**
 * Validates if a URL is a relative path.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - Returns true if the URL is a relative path, otherwise false.
 */
export function isRelativePath(url: string): boolean {
  if (url.startsWith('#')) return false; // ignore hash anchor
  if (url.startsWith('?')) return false; // ignore query
  if (url.startsWith('//')) return false; // ignore protocol relative urlet name
  if (ABS_URL_RE.test(url)) return false; // ignore absolute url
  if (ABS_PATH_RE.test(url)) return false; // ignore absolute path
  return true;
}
