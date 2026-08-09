import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

const port = Number(process.env.PORT ?? 5174);
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
  },
  preview: {
    port,
    host: "0.0.0.0",
  },
  test: {
    environment: "node",
    globals: false,
  },
});
