  
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    format: 'iife',
    file: 'dist/todoist.js'
  },
  plugins: [
    svelte(),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs()
  ]
}