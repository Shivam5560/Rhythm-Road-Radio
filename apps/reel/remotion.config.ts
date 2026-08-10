import { Config } from "@remotion/cli/config";
import path from "node:path";

// NOTE: Remotion's CLI bundles this file to CJS with esbuild and runs it via
// `eval()`, so `import.meta.url` resolves to nothing under Node's ESM loader
// here and `fileURLToPath` throws. Remotion's loader does
// `process.chdir(remotionRoot)` immediately before evaluating the config, so
// `process.cwd()` is the reliable way to find this package's directory.
const siteSrc = path.resolve(process.cwd(), "..", "web", "src");

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(4);

Config.overrideWebpackConfig((current) => ({
  ...current,
  resolve: {
    ...current.resolve,
    alias: {
      ...current.resolve?.alias,
      "@site": siteSrc,
    },
  },
}));
