import { expect, test } from 'vitest';

import { generateTypeName, getDataVariableName } from './utils';

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
