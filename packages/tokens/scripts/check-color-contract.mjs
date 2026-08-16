// Enforces the OKLCH source contract across tokens, components, and their Storybook workbench.
import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packagesDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceExtensions = new Set([".css", ".js", ".mjs", ".mdx", ".svelte", ".ts", ".tsx"]);
const ignoredDirectories = new Set(["dist", "node_modules", "storybook-static"]);
const legacyColorPattern = /#[0-9a-f]{3,8}\b|(?:rgb|rgba|hsl|hsla)\s*\(|color\s*\(\s*display-p3\b/i;
const primitiveComponentPattern =
  /var\(--(?:base-(?:brand|pressure|signal|neutral)|color-(?:neutral|brand|pressure|signal)-\d+)\)/;
const componentDirectory = resolve(packagesDirectory, "uikit/src/lib");
const violations = [];

const scan = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }

    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      await scan(path);
      continue;
    }

    if (!sourceExtensions.has(extname(entry.name))) {
      continue;
    }

    const lines = (await readFile(path, "utf8")).split(/\r?\n/);
    lines.forEach((line, index) => {
      if (legacyColorPattern.test(line)) {
        violations.push(`${relative(packagesDirectory, path)}:${index + 1}: legacy color: ${line.trim()}`);
      }

      if (path.startsWith(componentDirectory) && primitiveComponentPattern.test(line)) {
        violations.push(`${relative(packagesDirectory, path)}:${index + 1}: primitive token: ${line.trim()}`);
      }
    });
  }
};

await scan(packagesDirectory);

if (violations.length > 0) {
  throw new Error(`Color source contract violations:\n${violations.join("\n")}`);
}
