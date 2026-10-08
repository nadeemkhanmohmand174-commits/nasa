/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'apod.nasa.gov' },
      { protocol: 'https', hostname: 'apod.nasa.gov', pathname: '/image/**' },
      { protocol: 'https', hostname: 'images-assets.nasa.gov' },
      { protocol: 'https', hostname: 'mars.nasa.gov' },
      { protocol: 'https', hostname: 'mars.jpl.nasa.gov' },
      { protocol: 'https', hostname: 'epic.gsfc.nasa.gov' },
      { protocol: 'https', hostname: 'api.nasa.gov' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'www.nasa.gov' },
      { protocol: 'https', hostname: 'images.nasa.gov' },
      { protocol: 'https', hostname: 'ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
};

export default nextConfig;
