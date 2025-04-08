import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import {readFileSync} from 'node:fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      // This will allow you to use 'lib' as an alias for '/src/lib' in your imports
      lib: path.resolve(__dirname, 'src/lib'),
    },
  },
  define: {
    meta: {version: JSON.parse(readFileSync('package.json', 'utf8')).version},
  }
});