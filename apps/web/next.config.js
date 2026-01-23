/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@crm/types', '@crm/ui'],
  reactStrictMode: true,
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
}

module.exports = nextConfig
