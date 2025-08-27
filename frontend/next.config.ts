/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
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
}

module.exports = nextConfig