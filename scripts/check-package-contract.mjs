import { access, readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = resolve(repositoryRoot, "packages");
const issues = [];

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const collectExportTargets = (value) => {
  if (typeof value === "string") {
    return [value];
  }

  if (value === null || typeof value !== "object") {
    return [];
  }

  return Object.values(value).flatMap(collectExportTargets);
};

const isIncludedByFiles = (target, files) => {
  if (target === "package.json") {
    return true;
  }

  return files
    .filter((entry) => !entry.startsWith("!"))
    .some((entry) => {
      const prefix = entry.split("*", 1)[0].replace(/\/$/, "");
      return target === prefix || target.startsWith(prefix + "/");
    });
};

const verifyPublishedPackage = async (packageRoot, manifest) => {
  const packageLabel = relative(repositoryRoot, packageRoot);

  if (manifest.private !== false) {
    issues.push(packageLabel + ": publishable packages must set private to false explicitly");
  }
  if (typeof manifest.description !== "string" || manifest.description.trim() === "") {
    issues.push(packageLabel + ": missing package description");
  }
  if (manifest.license !== "MIT") {
    issues.push(packageLabel + ": expected MIT license metadata");
  }
  if (manifest.repository?.url !== "git+https://github.com/a-novel-kit/uikit.git") {
    issues.push(packageLabel + ": repository URL does not identify the UI kit");
  }
  if (manifest.exports === undefined) {
    issues.push(packageLabel + ": missing exports map");
    return;
  }
  if (!Array.isArray(manifest.files)) {
    issues.push(packageLabel + ": missing package files allowlist");
    return;
  }
  for (const requiredFile of ["README.md", "LICENSE"]) {
    if (!manifest.files.includes(requiredFile)) {
      issues.push(packageLabel + ": files must include " + requiredFile);
    }
  }

  const targets = [...new Set(collectExportTargets(manifest.exports))];
  for (const target of targets) {
    if (!target.startsWith("./")) {
      issues.push(packageLabel + ": export target must be package-relative: " + target);
      continue;
    }

    const cleanTarget = target.slice(2);
    const wildcardIndex = cleanTarget.indexOf("*");
    const diskTarget =
      wildcardIndex === -1
        ? resolve(packageRoot, cleanTarget)
        : resolve(packageRoot, cleanTarget.slice(0, wildcardIndex).replace(/\/$/, ""));

    if (!(await exists(diskTarget))) {
      issues.push(packageLabel + ": export target does not exist after build: " + target);
    }
    if (!isIncludedByFiles(cleanTarget, manifest.files)) {
      issues.push(packageLabel + ": export target is excluded from package files: " + target);
    }
  }

  if (targets.some((target) => target.endsWith(".css"))) {
    const sideEffects = Array.isArray(manifest.sideEffects) ? manifest.sideEffects : [];
    if (!sideEffects.includes("**/*.css")) {
      issues.push(packageLabel + ": CSS exports must be declared as side effects");
    }
  }
};

const packageEntries = (await readdir(packagesRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .sort((left, right) => left.name.localeCompare(right.name));

for (const entry of packageEntries) {
  const packageRoot = resolve(packagesRoot, entry.name);
  const manifestPath = resolve(packageRoot, "package.json");

  if (!(await exists(manifestPath))) {
    continue;
  }

  const manifest = await readJson(manifestPath);
  if (manifest.private === true) {
    continue;
  }

  await verifyPublishedPackage(packageRoot, manifest);
}

const uikitSourceRoot = resolve(packagesRoot, "uikit/src/lib");
const indexPath = resolve(uikitSourceRoot, "index.ts");
const indexSource = ts.createSourceFile(
  indexPath,
  await readFile(indexPath, "utf8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS
);
const barrelExports = new Map();

for (const statement of indexSource.statements) {
  if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier || !ts.isNamedExports(statement.exportClause)) {
    continue;
  }

  const specifier = statement.moduleSpecifier.text;
  const entries = barrelExports.get(specifier) ?? [];
  for (const element of statement.exportClause.elements) {
    entries.push({
      imported: element.propertyName?.text ?? element.name.text,
      exported: element.name.text,
    });
  }
  barrelExports.set(specifier, entries);
}

const exportedDeclarationNames = (sourceText, path) => {
  const source = ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const names = [];

  for (const statement of source.statements) {
    const exported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) {
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      names.push(...statement.declarationList.declarations.map((declaration) => declaration.name.getText(source)));
    } else if (statement.name) {
      names.push(statement.name.text);
    }
  }

  return names;
};

const componentFiles = (await readdir(uikitSourceRoot))
  .filter((name) => name.endsWith(".svelte") && name !== "Content.svelte")
  .sort();
const publicModules = [...componentFiles, "content.ts", "types.ts"];

for (const filename of publicModules) {
  const path = resolve(uikitSourceRoot, filename);
  const raw = await readFile(path, "utf8");
  const sourceText = filename.endsWith(".svelte")
    ? raw.match(/<script\s+lang="ts"\s+module>([\s\S]*?)<\/script>/)?.[1]
    : raw;
  const specifier = "./" + (filename.endsWith(".ts") ? filename.slice(0, -".ts".length) : filename);
  const entries = barrelExports.get(specifier) ?? [];

  if (filename.endsWith(".svelte")) {
    const componentName = filename.slice(0, -".svelte".length);
    if (!entries.some((entry) => entry.imported === "default" && entry.exported === componentName)) {
      issues.push("packages/uikit/src/lib/index.ts: missing component export for " + filename);
    }
  }

  if (sourceText === undefined) {
    issues.push("packages/uikit/src/lib/" + filename + ": missing module script for public types");
    continue;
  }

  for (const name of exportedDeclarationNames(sourceText, path)) {
    if (!entries.some((entry) => entry.imported === name && entry.exported === name)) {
      issues.push("packages/uikit/src/lib/index.ts: missing type export " + name + " from " + filename);
    }
  }
}

if (issues.length > 0) {
  throw new Error("Package contract violations:\n" + issues.join("\n"));
}
