import { fileURLToPath } from "node:url";

import { defineProject } from "vitest/config";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { playwright } from "@vitest/browser-playwright";

export default defineProject({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [svelte(), svelteTesting()],
  resolve: {
    conditions: ["browser"],
  },
  test: {
    name: "uikit-browser",
    include: ["src/**/*.browser.test.ts"],
    browser: {
      enabled: true,
      provider: playwright({}),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
  },
});
