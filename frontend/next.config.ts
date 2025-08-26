/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    reactStrictMode: true,
    // Note: rewrites don't work with static export
    // API calls should go directly to your backend or Supabase functions
}

module.exports = nextConfig