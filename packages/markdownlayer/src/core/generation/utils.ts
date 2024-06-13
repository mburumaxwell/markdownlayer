import { camelCase } from 'change-case';
import { slug as githubSlug } from 'github-slugger';
import { pluralize } from 'inflection';
import path from 'path';

import type { DocumentDefinitionGitOptions } from '../types';

export function makeVariableName(id: string) {
  return leftPadWithUnderscoreIfStartsWithNumber(camelCase(idToFileName(id).replace(/[^A-Z0-9_]/gi, '/0')));
}

export function getDataVariableName(type: string): string {
  return 'all' + uppercaseFirstChar(pluralize(type));
}
export function idToFileName(id: string): string {
  return leftPadWithUnderscoreIfStartsWithNumber(id).replace(/\//g, '__');
}

export function leftPadWithUnderscoreIfStartsWithNumber(str: string): string {
  return /^[0-9]/.test(str) ? '_' + str : str;
}

export function uppercaseFirstChar(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toPascalCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9]+/g, ' ') // Replace non-alphanumeric characters with spaces
    .split(' ') // Split the string by spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word and join them
    .join('');
}

export function getDocumentIdAndSlug(relativePath: string): { id: string; slug: string } {
  const withoutFileExt = relativePath.replace(new RegExp(path.extname(relativePath) + '$'), '');
  const rawSlugSegments = withoutFileExt.split(path.sep);

  const slug = rawSlugSegments
    // Slugify each route segment to handle capitalization and spaces.
    // Note: using `slug` instead of `new Slugger()` means no slug deduping.
    .map((segment) => githubSlug(segment))
    .join('/')
    .replace(/\/index$/, '');

  return {
    id: path.normalize(relativePath),
    slug,
  };
}

export function getDocumentDefinitionGitOptions(
  git: boolean | DocumentDefinitionGitOptions,
): DocumentDefinitionGitOptions {
  // If git is false, return default values with git functionality disabled
  if (git === false) return { updated: false, authors: false };

  // If git is true, return the default values
  if (git === true) return { updated: true, authors: false };

  // If git is an object, destructure it with default values
  const { updated = true, authors = false } = git;
  return { updated, authors };
}
