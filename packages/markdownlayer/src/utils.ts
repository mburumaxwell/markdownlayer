import { pluralize, singularize } from 'inflection';

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
