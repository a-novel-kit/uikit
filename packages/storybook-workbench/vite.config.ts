import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

import { svelte } from "@sveltejs/vite-plugin-svelte";

const svelteConfig = fileURLToPath(new URL("./svelte.config.js", import.meta.url));

export default defineConfig({
  plugins: [svelte({ configFile: svelteConfig })],
});
