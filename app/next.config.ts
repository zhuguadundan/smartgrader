import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用独立输出模式，用于Docker部署
  output: 'standalone',
  
  // 实验性功能
  experimental: {
    // 其他实验性配置可以在这里添加
  },
  
  // 图片优化配置
  images: {
    // 允许的图片域名
    domains: [],
    // 图片格式
    formats: ['image/webp', 'image/avif'],
  },
  
  // 压缩配置
  compress: true,
  
  // 性能优化
  poweredByHeader: false,
  
  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 重定向配置
  async redirects() {
    return [];
  },
  
  // 重写配置
  async rewrites() {
    return [];
  },
  
  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
