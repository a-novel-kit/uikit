// Fails when a source file under packages/ authors a color outside OKLCH, or when a uikit component
// reads a primitive palette token.
import { readFile, readdir } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const packagesDirectory = resolve(import.meta.dirname, "../..");
const sourceExtensions = new Set([".css", ".js", ".mjs", ".mdx", ".svelte", ".ts", ".tsx"]);
const ignoredDirectories = new Set([".svelte-kit", "dist", "node_modules", "storybook-static"]);
const legacyColorPattern = /#[0-9a-f]{3,8}\b|(?:rgb|rgba|hsl|hsla)\s*\(|color\s*\(\s*display-p3\b/i;
const primitiveComponentPattern =
  /var\(--(?:base-(?:brand|pressure|signal|neutral)|color-(?:neutral|brand|pressure|signal)-\d+)\)/;
const componentDirectory = resolve(packagesDirectory, "uikit/src/lib");
const violations = [];

async function checkFile(path) {
  const lines = (await readFile(path, "utf8")).split(/\r?\n/);
  const file = relative(packagesDirectory, path);
  const isComponent = path.startsWith(componentDirectory);

  for (const [index, line] of lines.entries()) {
    if (legacyColorPattern.test(line)) violations.push(`${file}:${index + 1}: legacy color: ${line.trim()}`);
    if (isComponent && primitiveComponentPattern.test(line)) {
      violations.push(`${file}:${index + 1}: primitive token: ${line.trim()}`);
    }
  }
}

async function scan(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;

    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (sourceExtensions.has(extname(entry.name))) await checkFile(path);
  }
}

await scan(packagesDirectory);

if (violations.length > 0) {
  throw new Error(`Color source contract violations:\n${violations.join("\n")}`);
}
