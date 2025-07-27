/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  
  basePath: process.env.NODE_ENV === 'production' ? '/lyxa-react-app' : '', 
  trailingSlash: true, 
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
