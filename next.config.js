/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true, async rewrites() { return [{ source: '/api/:path*', destination: 'https://unrifled-hyped-fredrick.ngrok-free.dev/api/:path*' }]; } };
module.exports = nextConfig;
