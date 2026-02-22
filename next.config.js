/** @type {import('next').NextConfig} */
const nextConfig = {
  // SSR mode for dynamic routes (courses, profiles)
  // Vercel handles this natively
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
