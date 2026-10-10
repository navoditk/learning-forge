import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // /resources reads the authoritative source register at request time.
  outputFileTracingIncludes: {
    '/resources': ['./docs/curriculum-sources.md'],
  },
};

export default nextConfig;
