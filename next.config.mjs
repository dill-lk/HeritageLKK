import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "react-router-dom": path.resolve("./client/lib/next-router-shim.tsx"),
    };

    return config;
  },
};

export default nextConfig;
