/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
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
