import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "demo"),
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
