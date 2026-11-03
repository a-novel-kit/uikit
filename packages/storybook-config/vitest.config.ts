import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    name: "storybook-config",
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
    exclude: ["test/**/*.browser.test.ts"],
    coverage: {
      enabled: false,
    },
  },
});
