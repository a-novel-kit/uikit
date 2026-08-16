import { fileURLToPath } from "node:url";

import { defineConfig, defineProject } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { playwright } from "@vitest/browser-playwright";

const storybookConfigDirectory = fileURLToPath(new URL("./packages/storybook/.storybook", import.meta.url));
const storybookRoot = fileURLToPath(new URL("./packages/storybook", import.meta.url));
const storybookSvelteConfig = fileURLToPath(new URL("./packages/storybook/svelte.config.js", import.meta.url));
const uikitSource = fileURLToPath(new URL("./packages/uikit/src/lib/index.ts", import.meta.url));

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
    projects: [
      "packages/uikit",
      "packages/uikit/vitest.browser.config.ts",
      defineProject({
        extends: true,
        root: storybookRoot,
        resolve: { alias: { "@a-novel-kit/uikit": uikitSource } },
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
