import { configDefaults, defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'path'

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
          src: "manifest.json",
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
    }
  },
  test: {
    watch: false,
    exclude: [...configDefaults.exclude, ".direnv/**/*"],
  }
})
