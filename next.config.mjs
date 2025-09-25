/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 解决HTTP 431请求头过大问题
  experimental: {
    serverComponentsExternalPackages: [],
    // 增加请求体大小限制
    largePageDataBytes: 128 * 1000, // 128KB
  },
  // 自定义服务器配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

export default nextConfig
