import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      clean: true,
      provider: "v8",
      reporter: ["text", "json", "lcov"],
      reportsDirectory: "coverage",
      include: ["packages/*/scripts/**", "packages/*/src/**"],
    },
    // Every package holding tests is registered here — vitest collects only from
    // registered projects, so a package left out is silently never run.
    projects: [{ root: "packages/tokens", extends: true }],
  },
});
