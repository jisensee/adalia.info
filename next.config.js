/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    webpackBuildWorker: true,
  },
}

// const withPWA = require('@ducanh2912/next-pwa').default({
//   dest: 'public',
// })

// module.exports = withPWA(nextConfig)
module.exports = nextConfig
