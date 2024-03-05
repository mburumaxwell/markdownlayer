import { withMarkdownlayer } from 'markdownlayer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withMarkdownlayer(nextConfig); // requires markdownlayer.config.ts

// You can also pass the config object to the `withMarkdownlayer` function (markdownlayer.config.ts will be ignored)
// export default withMarkdownlayer(nextConfig, {
//   contentDirPath: './src/content',
//   definitions: [
//     { type: 'LegalDoc', patterns: 'legal/*.{md,mdoc,mdx}' },

//     // blog
//     { type: 'BlogPost', patterns: 'blog/posts/*.{md,mdoc,mdx}' },
//     { type: 'Changelog', patterns: 'blog/changelog/*.{md,mdoc,mdx}' },
//   ],
//   remarkPlugins: [],
//   rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypePrettyCode],
// });
