import { fileURLToPath } from "node:url";

import { defineProject } from "vitest/config";

import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineProject({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [svelte({ configFile: fileURLToPath(new URL("./svelte.config.js", import.meta.url)) })],
  test: {
    name: "uikit-ssr",
    environment: "node",
    include: ["src/**/*.ssr.test.ts"],
  },
});
