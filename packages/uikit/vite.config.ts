import { defineConfig } from "vitest/config";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";

// Component tests run under jsdom via @testing-library/svelte. svelteTesting()
// resolves Svelte's browser build (avoids lifecycle_function_unavailable) and
// auto-cleans between tests. The real-browser harness (vitest-browser-svelte)
// lands with the test-harness task.
export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.ts"],
  },
});
