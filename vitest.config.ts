import { fileURLToPath } from "node:url";

import { defineConfig, defineProject } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { playwright } from "@vitest/browser-playwright";

const storybookConfigDirectory = fileURLToPath(new URL("./packages/storybook/.storybook", import.meta.url));
const storybookRoot = fileURLToPath(new URL("./packages/storybook", import.meta.url));
const storybookSvelteConfig = fileURLToPath(new URL("./packages/storybook/svelte.config.js", import.meta.url));

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
      "packages/uikit",
      "packages/uikit/vitest.browser.config.ts",
      "packages/uikit/vitest.ssr.config.ts",
      defineProject({
        optimizeDeps: { include: ["@storybook/addon-docs/blocks", "react", "react/jsx-dev-runtime"] },
        test: {
          name: "storybook-config-browser",
          include: ["packages/storybook-config/test/**/*.browser.test.ts"],
          browser: {
            enabled: true,
            provider: playwright({}),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
          coverage: { enabled: false },
        },
      }),
      defineProject({
        extends: true,
        root: storybookRoot,
        plugins: [
          svelte({ configFile: storybookSvelteConfig }),
          storybookTest({
            configDir: storybookConfigDirectory,
            storybookScript: "pnpm storybook",
            storybookUrl: process.env.SB_URL,
          }),
        ],
        test: {
          name: "storybook",
          exclude: ["**/*.mdx"],
          browser: {
            enabled: true,
            provider: playwright({}),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
          coverage: {
            enabled: false,
          },
        },
      }),
    ],
  },
});
