import { configDefaults, defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path, { resolve } from 'path'
import { loadEnv } from 'vite'

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
    svelte({
      emitCss: false,
    }),
    viteStaticCopy({
      targets: [
        {
          src: "styles.css",
          dest: "",
        },
        {
          src: "../manifest.json",
          dest: "",
        }
      ]
    }),
  ],
  build: {
    // We aren't building a website, so we build in library mode
    // and bundle the output using our index.ts as the entrypoint.
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      fileName: "main",
      formats: ["cjs"]
    },
    rollupOptions: {
      external: ["obsidian"]
    },
    outDir: getOutDir(),
  },
  test: {
    watch: false,
    exclude: [...configDefaults.exclude, ".direnv/**/*"],
  }
})
