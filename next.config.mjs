/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local Supabase
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '55321',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '55321',
        pathname: '/storage/v1/object/**',
      },
      // Production Supabase
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Vercel deployment domains
      {
        protocol: 'https',
        hostname: 'reality-topaz.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
      // YouTube thumbnails
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      // TikTok CDN
      {
        protocol: 'https',
        hostname: '*.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-sg.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: '*.tiktokcdn-us.com',
      },
    ],
  },
};

export default nextConfig;
