import { describe, expect, it } from 'vitest';

import { generateTypeName, getDataVariableName } from './utils';

describe('getDataVariableName', () => {
  it('should return correct variable name for blog', () => {
    expect(getDataVariableName('blog')).toBe('allBlogs');
  });

  it('should return correct variable name for post', () => {
    expect(getDataVariableName('post')).toBe('allPosts');
  });

  it('should handle different cases for blog', () => {
    expect(getDataVariableName('blog')).toBe('allBlogs');
    expect(getDataVariableName('Blog')).toBe('allBlogs');
    expect(getDataVariableName('bLOG')).toBe('allBlogs');
    expect(getDataVariableName('BLOG')).toBe('allBlogs');
  });
});

describe('generateTypeName', () => {
  it('should generate correct type name for blog-posts', () => {
    expect(generateTypeName('blog-posts')).toBe('BlogPost');
  });

  it('should generate correct type name for posts', () => {
    expect(generateTypeName('posts')).toBe('Post');
  });

  it('should generate correct type name for comments', () => {
    expect(generateTypeName('comments')).toBe('Comment');
  });
});
