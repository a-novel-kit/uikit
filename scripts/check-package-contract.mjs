// Verifies what each publishable package ships after a build: manifest metadata, export targets
// and their files allowlist, the uikit barrel, and the headless authorization entry.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";

import ts from "typescript";

const repositoryRoot = resolve(import.meta.dirname, "..");
const packagesRoot = resolve(repositoryRoot, "packages");
const issues = [];

/** Returns the literal path prefix of a package pattern, without a wildcard or trailing slash. */
const literalPrefix = (pattern) => pattern.split("*", 1)[0].replace(/\/$/, "");

/** Lists every string target nested in a package exports map. */
const collectExportTargets = (value) => {
  if (typeof value === "string") return [value];
  if (value === null || typeof value !== "object") return [];
  return Object.values(value).flatMap(collectExportTargets);
};

/** Reports whether a package-relative path is published by the manifest's files allowlist. */
function isIncludedByFiles(target, files) {
  const coversTarget = (entry) => {
    const prefix = literalPrefix(entry);
    return target === prefix || target.startsWith(prefix + "/");
  };

  return target === "package.json" || files.some((entry) => !entry.startsWith("!") && coversTarget(entry));
}

async function verifyPublishedPackage(packageRoot, manifest) {
  const report = (message) => issues.push(`${relative(repositoryRoot, packageRoot)}: ${message}`);

  if (manifest.private !== false) report("publishable packages must set private to false explicitly");
  if (typeof manifest.description !== "string" || manifest.description.trim() === "") {
    report("missing package description");
  }
  if (manifest.license !== "MIT") report("expected MIT license metadata");
  if (manifest.repository?.url !== "git+https://github.com/a-novel-kit/uikit.git") {
    report("repository URL does not identify the UI kit");
  }
  if (manifest.exports === undefined) {
    report("missing exports map");
    return;
  }
  if (!Array.isArray(manifest.files)) {
    report("missing package files allowlist");
    return;
  }
  for (const requiredFile of ["README.md", "LICENSE"]) {
    if (!manifest.files.includes(requiredFile)) report("files must include " + requiredFile);
  }

  const targets = [...new Set(collectExportTargets(manifest.exports))];
  for (const target of targets) {
    if (!target.startsWith("./")) {
      report("export target must be package-relative: " + target);
      continue;
    }

    const packagePath = target.slice(2);
    if (!existsSync(resolve(packageRoot, literalPrefix(packagePath)))) {
      report("export target does not exist after build: " + target);
    }
    if (!isIncludedByFiles(packagePath, manifest.files)) {
      report("export target is excluded from package files: " + target);
    }
  }

  const declaresCssSideEffects = Array.isArray(manifest.sideEffects) && manifest.sideEffects.includes("**/*.css");
  if (targets.some((target) => target.endsWith(".css")) && !declaresCssSideEffects) {
    report("CSS exports must be declared as side effects");
  }
}

/** Names the declarations a module exports, as written in its source. */
function exportedDeclarationNames(sourceText, path) {
  const source = ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const names = [];

  for (const statement of source.statements) {
    if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;

    if (ts.isVariableStatement(statement)) {
      names.push(...statement.declarationList.declarations.map((declaration) => declaration.name.getText(source)));
    } else if (statement.name) {
      names.push(statement.name.text);
    }
  }

  return names;
}

// ---- Package manifests ----

const packageEntries = (await readdir(packagesRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .sort((left, right) => left.name.localeCompare(right.name));

for (const entry of packageEntries) {
  const packageRoot = resolve(packagesRoot, entry.name);
  const manifestPath = resolve(packageRoot, "package.json");
  if (!existsSync(manifestPath)) continue;

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.private !== true) await verifyPublishedPackage(packageRoot, manifest);
}

// ---- uikit barrel ----

const uikitSourceRoot = resolve(packagesRoot, "uikit/src/lib");
const indexPath = resolve(uikitSourceRoot, "index.ts");
const indexSource = ts.createSourceFile(
  indexPath,
  await readFile(indexPath, "utf8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS
);

// Maps each module specifier to the names the barrel re-exports from it.
const barrelExports = new Map();
for (const statement of indexSource.statements) {
  if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier || !ts.isNamedExports(statement.exportClause)) {
    continue;
  }

  const entries = barrelExports.get(statement.moduleSpecifier.text) ?? [];
  for (const element of statement.exportClause.elements) {
    entries.push({ imported: element.propertyName?.text ?? element.name.text, exported: element.name.text });
  }
  barrelExports.set(statement.moduleSpecifier.text, entries);
}

const componentFiles = (await readdir(uikitSourceRoot))
  .filter((name) => name.endsWith(".svelte") && name !== "Content.svelte")
  .sort();

for (const filename of [...componentFiles, "content.ts", "types.ts"]) {
  const path = resolve(uikitSourceRoot, filename);
  const raw = await readFile(path, "utf8");
  const isComponent = filename.endsWith(".svelte");
  const sourceText = isComponent ? raw.match(/<script\s+lang="ts"\s+module>([\s\S]*?)<\/script>/)?.[1] : raw;
  const entries = barrelExports.get("./" + filename.replace(/\.ts$/, "")) ?? [];
  const isReexported = (imported, exported) =>
    entries.some((entry) => entry.imported === imported && entry.exported === exported);

  if (isComponent && !isReexported("default", filename.replace(/\.svelte$/, ""))) {
    issues.push("packages/uikit/src/lib/index.ts: missing component export for " + filename);
  }

  if (sourceText === undefined) {
    issues.push("packages/uikit/src/lib/" + filename + ": missing module script for public types");
    continue;
  }

  for (const name of exportedDeclarationNames(sourceText, path)) {
    if (!isReexported(name, name)) {
      issues.push("packages/uikit/src/lib/index.ts: missing type export " + name + " from " + filename);
    }
  }
}

if (issues.length > 0) {
  throw new Error("Package contract violations:\n" + issues.join("\n"));
}

// The headless entry must resolve without a Svelte compiler, CSS loader, or auth client.
execFileSync(
  process.execPath,
  [
    "--input-type=module",
    "--eval",
    `import assert from "node:assert/strict";
     import { createAuthorizationController, useAuthorization } from "@a-novel-kit/uikit/authorization";
     assert.equal(createAuthorizationController({ getStatus: () => "allowed" }).state.status, "allowed");
     assert.equal(typeof useAuthorization, "function");`,
  ],
  { cwd: resolve(packagesRoot, "uikit"), stdio: "pipe" }
);
