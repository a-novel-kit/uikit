import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      clean: true,
      provider: "v8",
      reporter: ["text", "json", "lcov"],
      reportsDirectory: "coverage",
      // Vitest matches this against the root, or against each project root once --project filters the run.
      include: ["packages/uikit/src/lib/**/*.{svelte,ts}", "src/lib/**/*.{svelte,ts}"],
    },
    projects: [
      "packages/storybook-config",
      "packages/storybook-config/vitest.browser.config.ts",
      "packages/storybook-workbench",
      // The tokens package ships plain stylesheets and scripts, so its project needs no config file.
      {
        root: fileURLToPath(new URL("packages/tokens", import.meta.url)),
        test: { name: "tokens", environment: "node", include: ["scripts/**/*.test.mjs"] },
      },
      "packages/uikit",
      "packages/uikit/vitest.browser.config.ts",
      "packages/uikit/vitest.ssr.config.ts",
    ],
  },
});
