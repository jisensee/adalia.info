/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.influenceth.io',
      },
      {
        protocol: 'https',
        hostname: 'images-prerelease.influenceth.io',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_INFLUENCE_CLOUDFRONT_IMAGE_HOST,
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    }
    return config
  },
}

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
})

module.exports = withPWA(nextConfig)
