import { withMarkdowner } from 'markdowner';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withMarkdowner(nextConfig);
