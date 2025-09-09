/** @type {import('next').NextConfig} */
const nextConfig = {
  // 增加API路由的超时时间
  experimental: {
    serverExternalPackages: [],
  },
  // 配置API路由的超时时间
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  // 增加body解析限制
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;