import { defineConfig } from "vitest/config";

export default defineConfig({
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
