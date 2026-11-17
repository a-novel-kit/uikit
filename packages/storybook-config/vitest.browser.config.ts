import { chromium } from "../../vitest.chromium";

import { fileURLToPath } from "node:url";

import { defineProject } from "vitest/config";

export default defineProject({
  root: fileURLToPath(new URL(".", import.meta.url)),
  // The pre-bundled dependencies resolve from the package that declares them.
  optimizeDeps: { include: ["@storybook/addon-docs/blocks", "react", "react/jsx-dev-runtime"] },
  test: {
    name: "storybook-config-browser",
    include: ["test/**/*.browser.test.ts"],
    browser: chromium,
  },
});
