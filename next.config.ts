import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // 排除测试文件
  onDemandEntries: {
    // 排除测试文件
  },
};

export default nextConfig;
