import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
      "react-router-dom": path.resolve(__dirname, "./client/lib/next-router-shim.tsx"),
    },
  },
  test: {},
});
