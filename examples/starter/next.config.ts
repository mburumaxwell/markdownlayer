import { withMarkdownlayer } from 'markdownlayer';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ hostname: 'api.dicebear.com' }, { hostname: 'maxwellweru.com' }],
  },
};

export default withMarkdownlayer(nextConfig);
