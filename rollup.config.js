import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import autoPreprocess from "svelte-preprocess";
import replace from "@rollup/plugin-replace";

import gitVersion from "git-tag-version";
import copy from "rollup-plugin-copy";

export default {
  input: "src/index.ts",
  output: {
    format: "cjs",
    file: "dist/main.js",
    sourcemap: "inline",
    exports: "default",
  },
  external: ["obsidian", "path", "fs"],
  plugins: [
    replace({
      __buildVersion__: gitVersion({ uniqueSnapshot: true }),
    }),
    svelte({
      preprocess: autoPreprocess(),
    }),
    typescript({ sourceMap: true }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    copy({
      targets: [
        {
          src: "manifest.json",
          dest: "dist/",
        },
      ],
    }),
  ],
};
