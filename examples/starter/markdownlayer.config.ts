import type { MarkdownlayerConfig } from 'markdownlayer/core';
import rehypeSlug from 'rehype-slug';
import { z } from 'zod';
import { rehypeAutolinkHeadings, rehypePrettyCode } from './src/markdownlayer';

const markdownConfig: MarkdownlayerConfig = {
  contentDirPath: './src/content',
  definitions: {
    legal: {
      schema: z.object({
        title: z.string(),
        updated: z.coerce.date().optional(),
      }),
    },
    'blog-posts': {
      schema: z.object({
        title: z.string({ description: 'The title of the blog post' }),
        description: z.string({ description: 'Short description that is used for SEO, in RSS/ATOM feed, and in some subtitles' }),
        published: z.coerce.date(),
        updated: z.coerce.date(),
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
        published: z.coerce.date(),
        updated: z.coerce.date().optional(),
        category: z.enum(['sdk', 'dashboard', 'api', 'developer']).optional(),
        link: z.string({ description: 'Link for more information about the changelog such as docs or blog' }).url().optional(),
      }),
      git: false,
    },
    project: {
      schema: ({ image }) =>
        z.object({
          title: z.string(),
          description: z.string({ description: 'Short description that is used for SEO, in RSS/ATOM feed, and in some subtitles' }),
          logo: image().refine((img) => img.width >= 128, {
            message: 'The logo must be at least 128 pixels wide!',
          }),
          start: z.coerce.date(),
          end: z.coerce.date().optional(),
          website: z.string().url().optional(),
          industry: z.enum(['agriculture', 'banking', 'hospitality', 'medicine']),
        }),
    },
    guide: {
      schema: z.object({
        title: z.string(),
        description: z.string({ description: 'Short description that is used for SEO, in RSS/ATOM feed, and in some subtitles' }),
        updated: z.coerce.date().optional(),
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
};

export default markdownConfig;
