/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Allow MongoDB connections
  serverExternalPackages: ['mongoose'],
}

module.exports = nextConfig