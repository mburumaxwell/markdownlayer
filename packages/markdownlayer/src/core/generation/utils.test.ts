import { expect, test } from 'vitest';

import {
  convertDocumentToMjsContent,
  generateTypeName,
  getDataVariableName,
  getDocumentDefinitionGitOptions,
  getDocumentIdAndSlug,
  idToFileName,
  leftPadWithUnderscoreIfStartsWithNumber,
  makeVariableName,
  toPascalCase,
  uppercaseFirstChar,
} from './utils';

test('makeVariableName', () => {
  expect(makeVariableName('en/post-1.md')).toBe('enPost_01_0md');
  expect(makeVariableName('1en/post-1.md')).toBe('_1enPost_01_0md');
  expect(makeVariableName('en1/post-1.md')).toBe('en1Post_01_0md');
  expect(makeVariableName('1en1/post-1.md')).toBe('_1en1Post_01_0md');

  // without subdirectory
  expect(makeVariableName('post-1.md')).toBe('post_01_0md');
});

test('getDataVariableName', () => {
  expect(getDataVariableName('blog')).toBe('allBlogs');
  expect(getDataVariableName('post')).toBe('allPosts');
});

test('generateTypeName', () => {
  expect(generateTypeName('blog-posts')).toBe('BlogPost');
  expect(generateTypeName('posts')).toBe('Post');
  expect(generateTypeName('comments')).toBe('Comment');
});

test('idToFileName', () => {
  expect(idToFileName('en/post-1.md')).toBe('en__post-1.md');
});

test('leftPadWithUnderscoreIfStartsWithNumber', () => {
  expect(leftPadWithUnderscoreIfStartsWithNumber('en')).toBe('en');
  expect(leftPadWithUnderscoreIfStartsWithNumber('1en')).toBe('_1en');
  expect(leftPadWithUnderscoreIfStartsWithNumber('en1')).toBe('en1');
  expect(leftPadWithUnderscoreIfStartsWithNumber('1en1')).toBe('_1en1');
});

test('uppercaseFirstChar', () => {
  expect(uppercaseFirstChar('blog')).toBe('Blog');
  expect(uppercaseFirstChar('Blog')).toBe('Blog');
  expect(uppercaseFirstChar('bLOG')).toBe('BLOG');
  expect(uppercaseFirstChar('BLOG')).toBe('BLOG');
});

test('toPascalCase', () => {
  expect(toPascalCase('blog')).toBe('Blog');
  expect(toPascalCase('blog-post')).toBe('BlogPost');
  expect(toPascalCase('blog-posts')).toBe('BlogPosts');
  expect(toPascalCase('blog_post')).toBe('BlogPost');
  expect(toPascalCase('Blog')).toBe('Blog');
  expect(toPascalCase('Blog-Post')).toBe('BlogPost');
  expect(toPascalCase('Blog-Posts')).toBe('BlogPosts');
  expect(toPascalCase('post')).toBe('Post');
  expect(toPascalCase('pOST')).toBe('Post');
});

test('getDocumentIdAndSlug', () => {
  expect(getDocumentIdAndSlug('my-first-post.md')).toEqual({
    id: 'my-first-post.md',
    slug: 'my-first-post',
  });

  // nested directory
  expect(getDocumentIdAndSlug('en/posts/my-first-post.md')).toEqual({
    id: 'en/posts/my-first-post.md',
    slug: 'en/posts/my-first-post',
  });
});

test('getDocumentDefinitionGitOptions', () => {
  // Test case 1: git is false
  expect(getDocumentDefinitionGitOptions(false)).toEqual({ updated: false, authors: false });

  // Test case 2: git is true
  expect(getDocumentDefinitionGitOptions(true)).toEqual({ updated: true, authors: false });

  // Test case 3: git is an object with updated and authors properties
  expect(getDocumentDefinitionGitOptions({ updated: true, authors: true })).toEqual({
    updated: true,
    authors: true,
  });

  // Test case 4: git is an object with only updated property
  expect(getDocumentDefinitionGitOptions({ updated: false })).toEqual({
    updated: false,
    authors: false,
  });

  // Test case 5: git is an object with only authors property
  expect(getDocumentDefinitionGitOptions({ authors: true })).toEqual({
    updated: true,
    authors: true,
  });
});

test('convertDocumentToMjsContent', () => {
  // Test case 1: Empty object
  expect(convertDocumentToMjsContent({})).toBe('export default {  }');

  // Test case 2: Object with string properties
  expect(convertDocumentToMjsContent({ name: 'John', age: '30' })).toBe(`export default { name: "John", age: "30" }`);

  // Test case 3: Object with number properties
  expect(convertDocumentToMjsContent({ id: 1, quantity: 5 })).toBe(`export default { id: 1, quantity: 5 }`);

  // Test case 4: Object with boolean properties
  expect(convertDocumentToMjsContent({ isActive: true, isAdmin: false })).toBe(
    `export default { isActive: true, isAdmin: false }`,
  );

  // Test case 5: Object with array properties
  expect(convertDocumentToMjsContent({ numbers: [1, 2, 3], names: ['Alice', 'Bob'] })).toBe(
    `export default { numbers: [1, 2, 3], names: ["Alice", "Bob"] }`,
  );

  // Test case 6: Object with nested objects
  expect(convertDocumentToMjsContent({ person: { name: 'John', age: 30 } })).toBe(
    `export default { person: { name: "John", age: 30 } }`,
  );

  // Test case 7: Object with Date property
  const date = new Date('2022-01-01T00:00:00.000Z');
  expect(convertDocumentToMjsContent({ createdAt: date })).toBe(
    `export default { createdAt: new Date('2022-01-01T00:00:00.000Z') }`,
  );

  // Test case 8: Object with null property
  expect(convertDocumentToMjsContent({ name: null })).toBe(`export default { name: null }`);

  // Test case 9: Object with undefined property
  expect(convertDocumentToMjsContent({ name: undefined })).toBe(`export default { name: null }`);

  // Test case 10: Object with 3 levels of nesting
  expect(
    convertDocumentToMjsContent({
      isActive: true,
      person: { name: 'John', address: { city: 'New York', country: 'USA' } },
    }),
  ).toBe(`export default { isActive: true, person: { name: "John", address: { city: "New York", country: "USA" } } }`);
});
