import { defineConfig } from "vitest/config";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";

// Component tests run under jsdom via @testing-library/svelte. svelteTesting()
// resolves Svelte's browser build and cleans up between tests.
export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.ts"],
    exclude: ["src/**/*.browser.test.ts"],
  },
});
