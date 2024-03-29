import type { MarkdownlayerConfig } from 'markdownlayer/core';
import rehypeSlug from 'rehype-slug';
import { rehypeAutolinkHeadings, rehypePrettyCode } from './src/markdownlayer';

const markdownConfig: MarkdownlayerConfig = {
  contentDirPath: './src/content',
  definitions: [
    { type: 'LegalDoc', patterns: 'legal/*.{md,mdoc,mdx}' },
    {
      type: 'BlogPost',
      patterns: 'blog/posts/*.{md,mdoc,mdx}',
      async validate(document) {
        if (document.image) {
          console.log('BlogPost has an image:', document.image);
        }
      },
    },
    { type: 'Changelog', patterns: 'blog/changelog/*.{md,mdoc,mdx}' },
  ],
  remarkPlugins: [],
  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypePrettyCode],
};

export default markdownConfig;
