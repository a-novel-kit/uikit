import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoots = [
  resolve(repositoryRoot, "packages/uikit/src/lib"),
  resolve(repositoryRoot, "packages/icons/src/lib"),
  resolve(repositoryRoot, "packages/storybook-config/src"),
];
const explicitSources = [resolve(repositoryRoot, "packages/tokens/palette.d.ts")];
const ignoredNames = new Set(["app.d.ts"]);
const sourceExtensions = new Set([".svelte", ".ts"]);

const collectSources = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const sources = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      sources.push(...(await collectSources(path)));
      continue;
    }

    if (
      sourceExtensions.has(extname(entry.name)) &&
      !entry.name.includes(".test.") &&
      !entry.name.includes(".spec.") &&
      !ignoredNames.has(entry.name)
    ) {
      sources.push(path);
    }
  }

  return sources;
};

const hasJsDoc = (node, source) => {
  const leadingText = source.text.slice(node.getFullStart(), node.getStart(source));
  return /\/\*\*[\s\S]*?\*\/\s*$/.test(leadingText);
};

const isExported = (node) =>
  ts.isExportAssignment(node) || node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);

const declarationName = (node, source) => {
  if (ts.isVariableStatement(node)) {
    return node.declarationList.declarations.map((declaration) => declaration.name.getText(source)).join(", ");
  }

  if (ts.isExportAssignment(node)) {
    return "default export";
  }

  return node.name?.getText(source) ?? "export";
};

const issues = [];
const report = (path, node, source, name) => {
  const position = source.getLineAndCharacterOfPosition(node.getStart(source));
  issues.push(relative(repositoryRoot, path) + ":" + (position.line + 1) + ": missing JSDoc for " + name);
};

const sources = [...explicitSources];
for (const root of publicRoots) {
  sources.push(...(await collectSources(root)));
}

for (const path of sources.sort()) {
  const raw = await readFile(path, "utf8");
  const moduleScript = path.endsWith(".svelte")
    ? raw.match(/<script\s+lang="ts"\s+module>([\s\S]*?)<\/script>/)?.[1]
    : raw;

  if (moduleScript === undefined) {
    continue;
  }

  const source = ts.createSourceFile(path, moduleScript, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  for (const statement of source.statements) {
    if (!isExported(statement) || ts.isExportDeclaration(statement)) {
      continue;
    }

    const name = declarationName(statement, source);
    if (!hasJsDoc(statement, source)) {
      report(path, statement, source, name);
    }

    if (!ts.isInterfaceDeclaration(statement)) {
      continue;
    }

    for (const member of statement.members) {
      if (!hasJsDoc(member, source)) {
        report(path, member, source, name + "." + (member.name?.getText(source) ?? "member"));
      }
    }
  }
}

if (issues.length > 0) {
  throw new Error("Public API documentation is incomplete:\n" + issues.join("\n"));
}
