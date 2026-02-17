const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        unoptimized: true,
    },
    async redirects() {
        return [
            {
                source: '/admin',
                destination: '/dashboard',
                permanent: true,
            },
        ]
    },
}

module.exports = nextConfig
