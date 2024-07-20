import { defineConfig, z } from 'markdownlayer';
import rehypeSlug from 'rehype-slug';
import { rehypeAutolinkHeadings, rehypePrettyCode } from './src/markdownlayer';

export default defineConfig({
  contentDirPath: './src/content',
  definitions: {
    authors: {
      schema: ({ id, image }) =>
        z.object({
          id: id({ default: false }),
          name: z.string(),
          twitter: z.string(),
          url: z.string().url(),
          avatar: image({ remote: true }),
        }),
    },
    legal: {
      schema: ({ body, slug }) =>
        z.object({
          title: z.string(),
          updated: z.coerce.isodate().optional(),
          slug: slug(),
          body: body(),
        }),
    },
    'blog-posts': {
      schema: ({ body, git, id, image, readtime, slug }) =>
        z
          .object({
            id: id(),
            git: git({ author: true }),
            title: z.string(),
            description: z.string(),
            published: z.coerce.isodate(),
            updated: z.coerce.isodate().optional(),
            keywords: z.string().array().default([]),
            draft: z.boolean().default(false),
            image: image().optional(),
            slug: slug(),
            readtime: readtime(),
            body: body(),
          })
          .transform((data) => ({
            ...data,
            authors: (data.git.author && [data.git.author]) || [],
            updated: data.updated ?? data.git.date,
          })),
    },
    changelog: {
      schema: ({ body, id }) =>
        z.object({
          id: id(),
          title: z.string(),
          published: z.coerce.isodate(),
          updated: z.coerce.isodate().optional(),
          category: z.enum(['sdk', 'dashboard', 'api', 'developer']).optional(),
          link: z.string().url().optional(),
          body: body(),
        }),
    },
    project: {
      schema: ({ body, image }) =>
        z.object({
          title: z.string(),
          description: z.string(),
          logo: image().refine((img) => img.width >= 128, { message: 'The logo must be at least 128 pixels wide!' }),
          start: z.coerce.isodate(),
          end: z.coerce.isodate().optional(),
          website: z.string().url().optional(),
          industry: z.enum(['agriculture', 'banking', 'hospitality', 'medicine']),
          body: body(),
        }),
    },
    guide: {
      schema: ({ body, git, readtime, slug, toc }) =>
        z
          .object({
            git: git({ author: true }),
            title: z.string(),
            description: z.string(),
            updated: z.coerce.isodate().optional(),
            keywords: z.string().array().default([]),
            draft: z.boolean().default(false),
            unlisted: z.boolean().default(false),
            sidebar_label: z.string().optional(),
            pagination_label: z.string().optional(),
            slug: slug(),
            readtime: readtime({ wordsPerMinute: 200 }),
            body: body(),
            toc: toc(),
          })
          .transform((data) => ({
            ...data,
            authors: (data.git.author && [data.git.author]) || [],
            updated: data.updated ?? data.git.date,
          })),
    },
  },
  remarkPlugins: [],
  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypePrettyCode],
});
