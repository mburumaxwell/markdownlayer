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
//     {
//       type: 'BlogPost',
//       patterns: 'blog/posts/*.{md,mdoc,mdx}',
//       async validate(document) {
//         if (document.image) {
//           console.log('BlogPost has an image:', document.image);
//         }
//       },
//     },
//     { type: 'Changelog', patterns: 'blog/changelog/*.{md,mdoc,mdx}', lastUpdatedFromGit: false },
//   ],
//   remarkPlugins: [],
//   rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypePrettyCode],
// });
