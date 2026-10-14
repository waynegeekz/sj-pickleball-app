import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Payment screenshots go through a server action; the default 1 MB cap is below a phone screenshot.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
