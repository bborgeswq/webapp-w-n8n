/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '150mb',
    },
  },
  images: {
    remotePatterns: [],
  },
  // Aumentar timeout para uploads grandes
  api: {
    bodyParser: {
      sizeLimit: '150mb',
    },
    responseLimit: '150mb',
  },
}

module.exports = nextConfig
