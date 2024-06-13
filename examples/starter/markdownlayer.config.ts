import type { MarkdownlayerConfig } from 'markdownlayer/core';
import rehypeSlug from 'rehype-slug';
import { z } from 'zod';
import { rehypeAutolinkHeadings, rehypePrettyCode } from './src/markdownlayer';

const markdownConfig: MarkdownlayerConfig = {
  contentDirPath: './src/content',
  definitions: [
    {
      type: 'LegalDoc',
      patterns: 'legal/*.{md,mdoc,mdx}',
      schema: z.object({
        title: z.string(),
        updated: z.coerce.date().optional(),
      }),
    },
    {
      type: 'BlogPost',
      patterns: 'blog/posts/*.{md,mdoc,mdx}',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        published: z.coerce.date(),
        updated: z.coerce.date().optional(),
        authors: z.string().array().default([]),
        keywords: z.string().array().default([]),
        draft: z.boolean().default(false),
        image: z.string().optional(),
      }),
    },
    {
      type: 'Changelog',
      patterns: 'blog/changelog/*.{md,mdoc,mdx}',
      schema: z.object({
        title: z.string(),
        published: z.coerce.date(),
        updated: z.coerce.date().optional(),
        link: z.string().url().optional(),
        category: z.enum(['sdk', 'dashboard', 'api', 'developer']).optional(),
      }),
      lastUpdatedFromGit: false,
    },
    {
      type: 'Project',
      patterns: 'projects/*.{md,mdoc,mdx}',
      schema: ({ image }) =>
        z.object({
          title: z.string(),
          description: z.string(),
          logo: image().refine((img) => img.width >= 128, {
            message: 'The logo must be at least 128 pixels wide!',
          }),
          start: z.coerce.date(),
          end: z.coerce.date().optional(),
          website: z.string().url().optional(),
          industry: z.enum(['agriculture', 'banking', 'hospitality', 'medicine']),
        }),
    },
    {
      type: 'Guide',
      patterns: 'guides/*.{md,mdoc,mdx}',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        draft: z.boolean().default(false),
        unlisted: z.boolean().default(false),
        sidebar_label: z.string().optional(),
        pagination_label: z.string().optional(),
      }),
    },
  ],
  remarkPlugins: [],
  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypePrettyCode],
};

export default markdownConfig;
