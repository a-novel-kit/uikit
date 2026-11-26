import { chromium } from "../../vitest.chromium";

import { extname } from "node:path";
import { fileURLToPath } from "node:url";

import type { Plugin } from "vite";
import { defineProject } from "vitest/config";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";

/**
 * Serves a second copy of uikit to a test that imports a module of it with `?copy`: each module that copy imports by a
 * relative path carries the mark too, so the two copies share their dependencies, as two installed copies of a package
 * would, and none of their own modules. The mark ends on the module's own extension, which the transforms read.
 */
function secondCopy(): Plugin {
  const mark = "?copy";
  return {
    name: "uikit-second-copy",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!importer?.includes(mark) || !source.startsWith(".")) return null;
      const resolved = await this.resolve(source, importer.slice(0, importer.indexOf(mark)), { skipSelf: true });
      return resolved && { ...resolved, id: `${resolved.id}${mark}&lang${extname(resolved.id)}` };
    },
  };
}

export default defineProject({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [secondCopy(), svelte(), svelteTesting()],
  resolve: {
    conditions: ["browser"],
  },
  test: {
    name: "uikit-browser",
    include: ["src/**/*.browser.test.ts"],
    browser: chromium,
  },
});
