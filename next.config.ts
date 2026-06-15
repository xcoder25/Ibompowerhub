
import type { NextConfig } from 'next';
require('dotenv').config({ path: './.env' });


const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Increase chunk load timeout for slower/local network connections
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Give the browser 60 seconds to load a chunk before timing out
      config.output = {
        ...config.output,
        chunkLoadTimeout: 60000,
      };
    }
    return config;
  },
};

export default nextConfig;
