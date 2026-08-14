import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      clean: true,
      provider: "v8",
      reporter: ["text", "json", "lcov"],
      reportsDirectory: "coverage",
      include: ["packages/uikit/src/**/*.{svelte,ts}"],
    },
    // Each package holding tests is a project; a package left out is never run.
    projects: ["packages/uikit"],
  },
});
