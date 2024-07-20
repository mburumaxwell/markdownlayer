import { expect, test } from 'vitest';

import { generateTypeName, getDataVariableName, idToFileName, makeVariableName } from './utils';

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
