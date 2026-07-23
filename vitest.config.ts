import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/**/*.{test,spec}.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["packages/*/scripts/**", "packages/*/src/**"],
    },
  },
});
