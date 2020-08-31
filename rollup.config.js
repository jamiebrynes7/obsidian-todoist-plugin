  
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import autoPreprocess from 'svelte-preprocess';

export default {
  input: 'src/index.js',
  output: {
    format: 'iife',
    file: 'dist/todoist.js'
  },
  plugins: [
    svelte({
      preprocess: autoPreprocess()
    }),
    typescript(),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs()
  ]
}