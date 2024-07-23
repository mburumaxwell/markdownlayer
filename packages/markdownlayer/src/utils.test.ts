import { describe, expect, it } from 'vitest';

import { generateTypeName, getDataVariableName, isRelativePath } from './utils';

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

describe('isRelativePath', () => {
  it('should return true for relative paths', () => {
    expect(isRelativePath('relative/path')).toBe(true);
    expect(isRelativePath('./relative/path')).toBe(true);
    expect(isRelativePath('../relative/path')).toBe(true);
  });

  it('should return false for absolute URLs', () => {
    expect(isRelativePath('http://example.com')).toBe(false);
    expect(isRelativePath('https://example.com')).toBe(false);
    expect(isRelativePath('ftp://example.com')).toBe(false);
  });

  it('should return false for absolute paths', () => {
    expect(isRelativePath('/absolute/path')).toBe(false);
    expect(isRelativePath('C:\\absolute\\path')).toBe(false);
  });

  it('should return false for protocol-relative URLs', () => {
    expect(isRelativePath('//example.com')).toBe(false);
  });

  it('should return false for hash anchors', () => {
    expect(isRelativePath('#anchor')).toBe(false);
  });

  it('should return false for query strings', () => {
    expect(isRelativePath('?query=string')).toBe(false);
  });
});
