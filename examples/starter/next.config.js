import { withMarkdownlayer } from 'markdownlayer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ hostname: 'api.dicebear.com' }, { hostname: 'maxwellweru.com' }],
  },
};

export default await withMarkdownlayer(nextConfig);
