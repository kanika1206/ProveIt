/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://proveit-backend.onrender.com/api/:path*',
      },
      {
        source: '/ws/:path*',
        destination: 'https://proveit-backend.onrender.com/ws/:path*',
      },
    ]
  },
}

module.exports = nextConfig