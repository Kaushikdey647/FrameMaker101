import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phone-on-LAN testing: origin is the Mac IP, not localhost.
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  allowedDevOrigins: ["192.168.1.3"],
};

export default nextConfig;
