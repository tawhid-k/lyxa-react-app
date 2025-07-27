/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/lyxa-react-app',
  assetPrefix: '/lyxa-react-app',
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
};

module.exports = nextConfig;
