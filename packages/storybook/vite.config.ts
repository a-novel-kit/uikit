import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

import { svelte } from "@sveltejs/vite-plugin-svelte";

const uikitSource = fileURLToPath(new URL("../uikit/src/lib/index.ts", import.meta.url));
const svelteConfig = fileURLToPath(new URL("./svelte.config.js", import.meta.url));

export default defineConfig({
  // Stories keep consumer-shaped imports while resolving live workspace source during development.
  resolve: { alias: { "@a-novel-kit/uikit": uikitSource } },
  plugins: [svelte({ configFile: svelteConfig })],
});
