/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  experimental: {
    outputFileTracingIncludes: {
      '/*': ['./prisma/dev.db', './dev.db'],
    },
  },
};

module.exports = nextConfig;
