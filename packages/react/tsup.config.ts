import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  outDir: "dist",
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".js" : ".js",
    };
  },
  esbuildOptions(options) {
    options.outbase = "src";
  },
  external: ["react", "react-dom"],
  jsx: "react-jsx",
});
