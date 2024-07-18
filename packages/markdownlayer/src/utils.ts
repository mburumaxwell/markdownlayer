import { camelCase } from 'change-case';
import { pluralize, singularize } from 'inflection';

export function makeVariableName(id: string) {
  return leftPadWithUnderscoreIfStartsWithNumber(camelCase(idToFileName(id).replace(/[^A-Z0-9_]/gi, '/0')));
}

export function getDataVariableName(type: string): string {
  return 'all' + pluralize(toPascalCase(type));
}

export function generateTypeName(type: string): string {
  return singularize(toPascalCase(type));
}

export function idToFileName(id: string): string {
  return leftPadWithUnderscoreIfStartsWithNumber(id).replace(/\//g, '__');
}

export function leftPadWithUnderscoreIfStartsWithNumber(str: string): string {
  return /^[0-9]/.test(str) ? '_' + str : str;
}

export function toPascalCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9]+/g, ' ') // Replace non-alphanumeric characters with spaces
    .split(' ') // Split the string by spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word and join them
    .join('');
}
