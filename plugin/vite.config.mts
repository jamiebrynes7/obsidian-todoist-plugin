import { execSync } from "node:child_process";
import path, { resolve } from "node:path";
import replace from "@rollup/plugin-replace";
import { loadEnv } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsConfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

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

export default defineConfig({
  plugins: [
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
  ],
  build: {
    // We aren't building a website, so we build in library mode
    // and bundle the output using our index.ts as the entrypoint.
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      fileName: "main",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: ["obsidian"],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
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
