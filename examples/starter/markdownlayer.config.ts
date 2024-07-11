import { defineConfig } from 'markdownlayer/core';
import rehypeSlug from 'rehype-slug';
import { z } from 'zod';
import { rehypeAutolinkHeadings, rehypePrettyCode } from './src/markdownlayer';

// TODO: move this to the library but without coercing to string
function isodate() {
  return z.coerce
    .string()
    .refine((value) => !isNaN(Date.parse(value)), 'Invalid date string')
    .transform<string>((value) => new Date(value).toISOString());
}

export default defineConfig({
  contentDirPath: './src/content',
  definitions: {
    legal: {
      schema: z.object({
        title: z.string(),
        updated: isodate().optional(),
      }),
    },
    'blog-posts': {
      schema: z.object({
        title: z.string(),
        description: z.string(),
        published: isodate(),
        updated: isodate(),
        authors: z.string().array(),
        keywords: z.string().array().default([]),
        draft: z.boolean().default(false),
        image: z.string().optional(),
      }),
      git: { authors: true },
    },
    changelog: {
      schema: z.object({
        title: z.string(),
        published: isodate(),
        updated: isodate().optional(),
        category: z.enum(['sdk', 'dashboard', 'api', 'developer']).optional(),
        link: z.string().url().optional(),
      }),
      git: false,
    },
    project: {
      schema: ({ image }) =>
        z.object({
          title: z.string(),
          description: z.string(),
          logo: image().refine((img) => img.width >= 128, { message: 'The logo must be at least 128 pixels wide!' }),
          start: isodate(),
          end: isodate().optional(),
          website: z.string().url().optional(),
          industry: z.enum(['agriculture', 'banking', 'hospitality', 'medicine']),
        }),
    },
    guide: {
      schema: z.object({
        title: z.string(),
        description: z.string(),
        updated: isodate().optional(),
        authors: z.string().array().default([]),
        draft: z.boolean().default(false),
        unlisted: z.boolean().default(false),
        sidebar_label: z.string().optional(),
        pagination_label: z.string().optional(),
      }),
      git: { authors: true },
    },
  },
  remarkPlugins: [],
  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypePrettyCode],
});
