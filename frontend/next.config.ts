/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    reactStrictMode: true,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Warning: This allows production builds to successfully complete even if
        // your project has TypeScript errors.
        ignoreBuildErrors: true,
    },
    // Generate static pages for dynamic routes that might be accessed via direct links
    generateBuildId: async () => {
        return 'build-' + Date.now()
    },
    // Allow static export to work with dynamic routes that have search params
    serverExternalPackages: [],
}

module.exports = nextConfig