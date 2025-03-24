import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import fs from "fs";
import { resolve } from "path";

function collectExternalDependencies() {
  const packageJson = fs.readFileSync(resolve(__dirname, "package.json"), "utf8");
  const dependencies = JSON.parse(packageJson).dependencies;
  const peerDependencies = JSON.parse(packageJson).peerDependencies;
  return Object.keys(dependencies).concat(Object.keys(peerDependencies));
}

export default defineConfig({
  build: {
    lib: {
      formats: ["es"],
      entry: resolve(__dirname, "src", "index.ts"),
      fileName: () => "index.js",
    },
    outDir: resolve(__dirname, "dist"),
    rollupOptions: {
      external: collectExternalDependencies(),
    },
    minify: false,
    emptyOutDir: true,
    sourcemap: false,
  },
  plugins: [dts({ tsconfigPath: resolve(__dirname, "tsconfig.build.json"), rollupTypes: true })],
});
