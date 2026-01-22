/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
    // output: 'export', // Disabled to support dynamic routing
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    reactStrictMode: true,

    // Performance optimizations
    experimental: {
        optimizePackageImports: [
            '@radix-ui/react-icons',
            'lucide-react',
            'framer-motion'
        ],
        // optimizeCss: false, 
    },

    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    // Compress responses
    compress: true,
}

module.exports = nextConfig