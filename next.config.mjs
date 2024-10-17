/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.google.com', 'res.cloudinary.com'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
    serverComponentsExternalPackages: ["pdf-parse"],
  },
}

export default nextConfig