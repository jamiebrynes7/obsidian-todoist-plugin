import path, { resolve } from "path";
import replace from "@rollup/plugin-replace";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { loadEnv } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsConfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

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

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    svelte({
      emitCss: false,
    }),
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
