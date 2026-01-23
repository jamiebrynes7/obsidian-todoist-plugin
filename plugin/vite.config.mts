import replace from "@rollup/plugin-replace";
import react from "@vitejs/plugin-react";
import { loadEnv, type PluginOption } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsConfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

import { execSync } from "node:child_process";
import path, { resolve } from "node:path";

const { version } = require("./package.json");

function getOutDir(): string | undefined {
  const env = loadEnv("prod", process.cwd());
  if (env?.VITE_ENV !== "dev") {
    return undefined;
  }

  const vaultDir = env?.VITE_OBSIDIAN_VAULT;
  if (vaultDir === undefined) {
    return vaultDir;
  }

  return path.join(vaultDir, ".obsidian", "plugins", "todoist-sync-plugin");
}

function getBuildStamp(): string {
  const commitSha = execSync("git rev-parse --short HEAD").toString().trim();
  const timestamp = new Date().toISOString().slice(2, 16).replace(/[-:]/g, "");
  return `v${version}-${commitSha}-${timestamp}`;
}

function getShouldMinify(): boolean {
  const env = loadEnv("prod", process.cwd());
  return env?.VITE_ENV !== "dev";
}

function bundleAnalyzerPlugin(): PluginOption {
  const mode = process.env.VITE_BUNDLE_ANALYZER_MODE;
  if (mode === "server" || mode === "static" || mode === "json") {
    return analyzer({ analyzerMode: mode });
  }

  if (mode !== undefined) {
    throw new Error(`Invalid VITE_BUNDLE_ANALYZER_MODE: ${mode}`);
  }

  return undefined;
}

export default defineConfig({
  plugins: [
    react(),
    tsConfigPaths(),
    viteStaticCopy({
      targets: [
        {
          src: "../manifest.json",
          dest: "",
        },
      ],
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      SYNC_WITH_TODOIST_BUILD_STAMP: getBuildStamp(),
    }),
    bundleAnalyzerPlugin(),
  ],
  build: {
    // We aren't building a website, so we build in library mode
    // and bundle the output using our index.ts as the entrypoint.
    minify: getShouldMinify(),
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      fileName: "main",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: ["obsidian"],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "main.css") {
            return "styles.css";
          }

          return assetInfo.name as string;
        },
      },
    },
    outDir: getOutDir(),
  },
  test: {
    watch: false,
    exclude: [...configDefaults.exclude, ".direnv/**/*"],
    globals: true,
    environment: "jsdom",
    alias: {
      obsidian: resolve(__dirname, "src/mocks/obsidian.ts"),
    },
    setupFiles: ["./vitest-setup.ts"],
  },
});
