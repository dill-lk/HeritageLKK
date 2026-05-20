/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.NEXT_OUTPUT_EXPORT === "true" ? "export" : undefined,
};

export default nextConfig;
