
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ignoreBuildErrors: true,
}, 
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    images: { 
      remotePattrtns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
