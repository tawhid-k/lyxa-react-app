/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // required to generate static HTML
  basePath: '/lyxa-react-app', // Replace with your GitHub repo name
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
}

export default nextConfig
