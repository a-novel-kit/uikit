import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";

// Component tests run under jsdom via @testing-library/svelte. svelteTesting()
// resolves Svelte's browser build and cleans up between tests.
export default defineConfig({
  // Vitest sets a project's root after svelte() reads it, so without this the plugin starts from
  // the workspace root and leaves Svelte libraries such as @lucide/svelte untransformed.
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [svelte(), svelteTesting()],
  test: {
    name: "uikit-unit",
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.ts"],
    exclude: ["src/**/*.browser.test.ts", "src/**/*.ssr.test.ts"],
  },
});
