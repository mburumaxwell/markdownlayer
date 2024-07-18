import { expect, test } from 'vitest';

import {
  generateTypeName,
  getDataVariableName,
  idToFileName,
  leftPadWithUnderscoreIfStartsWithNumber,
  makeVariableName,
  toPascalCase,
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

  expect(getDataVariableName('blog')).toBe('allBlogs');
  expect(getDataVariableName('Blog')).toBe('allBlogs');
  expect(getDataVariableName('bLOG')).toBe('allBlogs');
  expect(getDataVariableName('BLOG')).toBe('allBlogs');
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
