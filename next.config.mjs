/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.google.com', 'res.cloudinary.com'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias['react-quill$'] = 'react-quill/dist/react-quill.js';
    
    // Exclude 'pdf-parse' from being bundled on the client-side
    if (!isServer) {
      config.externals.push('pdf-parse');
    }
    
    return config;
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  transpilePackages: ['react-quilljs', 'quill'],
  swcMinify: true,
};

export default nextConfig;