import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-ignore
    outputFileTracingIncludes: {
      '/api/chat': ['./data/**/*'],
    },
  },
};

export default nextConfig;
