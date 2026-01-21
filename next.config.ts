/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    reactStrictMode: true,

    // Performance optimizations (minimal features for static export compatibility)
    experimental: {
        optimizePackageImports: [
            '@radix-ui/react-icons',
            'lucide-react',
            'framer-motion'
        ],
        optimizeCss: false, // Disabled for static export compatibility
        // scrollRestoration disabled for static export compatibility
    },

    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Simplified webpack config for static export compatibility
    webpack: (config, { isServer }) => {
        // Basic bundle splitting for static export
        if (!isServer) {
            config.optimization.splitChunks.chunks = 'all'
        }

        return config
    },

    // Note: Custom headers don't work with static export
    // These would need to be set at the CDN/hosting level

    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    // Optimize static generation with longer timeout for complex pages
    staticPageGenerationTimeout: 30000,

    // Compress responses
    compress: true,
}

module.exports = nextConfig