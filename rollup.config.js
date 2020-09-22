import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import autoPreprocess from "svelte-preprocess";
import replace from "@rollup/plugin-replace";

import gitVersion from "git-tag-version";

export default {
  input: "src/index.js",
  output: {
    format: "iife",
    file: "dist/todoist.js",
  },
  plugins: [
    replace({
      __buildVersion__: gitVersion({ uniqueSnapshot: true }),
    }),
    svelte({
      preprocess: autoPreprocess(),
    }),
    typescript(),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
  ],
};

function getBuildVersion() {}
