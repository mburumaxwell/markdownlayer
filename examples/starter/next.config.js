const { withMarkdownlayer } = require('markdownlayer');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ hostname: 'api.dicebear.com' }, { hostname: 'maxwellweru.com' }],
  },
};

module.defaults = withMarkdownlayer(nextConfig);
