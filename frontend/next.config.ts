/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8080/:path*', // Proxy to Backend
            },
        ]
    },
}

module.exports = nextConfig