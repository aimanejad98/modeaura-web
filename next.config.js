const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['localhost'],
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
