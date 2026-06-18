import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: '*.redd.it' },
      { hostname: '*.reddit.com' },
      { hostname: 'i.ytimg.com' },
      { hostname: 'yt3.ggpht.com' },
      { hostname: 'ph-files.imgix.net' },
    ],
  },
};

export default nextConfig;
