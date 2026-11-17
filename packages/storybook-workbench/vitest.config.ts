import { chromium } from "../../vitest.chromium";

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineProject } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const root = fileURLToPath(new URL(".", import.meta.url));
const configDir = resolve(root, ".storybook");

export default defineProject({
  root,
  plugins: [
    svelte({ configFile: resolve(root, "svelte.config.js") }),
    storybookTest({ configDir, storybookScript: "pnpm storybook", storybookUrl: process.env.SB_URL }),
  ],
  test: {
    name: "storybook",
    exclude: ["**/*.mdx"],
    // Only the Drive runner in CI provides the screenshot directory, so other runs take no screenshots.
    setupFiles: process.env.PLAYWRIGHT_SNAPSHOT_DIR ? [resolve(configDir, "vitest.screenshot.ts")] : [],
    browser: {
      ...chromium,
      expect: {
        toMatchScreenshot: {
          resolveScreenshotPath: ({ arg, ext }) => resolve(process.env.PLAYWRIGHT_SNAPSHOT_DIR ?? "", `${arg}${ext}`),
        },
      },
    },
  },
});
