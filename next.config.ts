import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/chat': ['./data/**/*'],
    '/api/**/*': ['./data/**/*'],
  },
};

export default nextConfig;
