import { withMarkdownlayer } from 'markdownlayer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default await withMarkdownlayer(nextConfig);
