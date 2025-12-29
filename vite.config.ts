import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { readFileSync } from "node:fs";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      // This will allow you to use 'lib' as an alias for '/src/lib' in your imports
      lib: path.resolve(__dirname, "src/lib"),
    },
  },
  define: {
    'import.meta.env.VERSION': JSON.stringify(
      JSON.parse(readFileSync("package.json", "utf8")).version
    ),
  },
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "server",
          environment: "node",
          include: ["tests/**/*.{test,spec}.{js,ts}"],
          exclude: ["tests/**/*.svelte.{test,spec}.{js,ts}"],
        },
      },
    ],
  },
});
