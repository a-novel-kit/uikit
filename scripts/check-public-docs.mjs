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
const sourceExtensions = new Set([".svelte", ".ts", ".tsx"]);

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
const publicComponents = new Set();
for (const root of publicRoots) {
  sources.push(...(await collectSources(root)));
  const barrel = ts.createSourceFile(
    "index.ts",
    await readFile(resolve(root, "index.ts"), "utf8"),
    ts.ScriptTarget.Latest
  );
  for (const statement of barrel.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text.endsWith(".svelte") &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause) &&
      statement.exportClause.elements.some((entry) => entry.propertyName?.text === "default")
    ) {
      publicComponents.add(resolve(root, statement.moduleSpecifier.text));
    }
  }
}

for (const path of sources.sort()) {
  const raw = await readFile(path, "utf8");
  if (publicComponents.has(path) && !/<!--\s*@component\s+\S[\s\S]*?-->/.test(raw)) {
    issues.push(relative(repositoryRoot, path) + ": missing @component hover documentation");
  }
  const moduleScript = path.endsWith(".svelte")
    ? raw.match(/<script\s+lang="ts"\s+module>([\s\S]*?)<\/script>/)?.[1]
    : raw;

  if (moduleScript === undefined) {
    continue;
  }

  const source = ts.createSourceFile(
    path,
    moduleScript,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const checkMembers = (node, name) => {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeLiteralNode(node)) {
      for (const member of node.members) {
        const memberName = name + "." + (member.name?.getText(source) ?? "member");
        if (!hasJsDoc(member, source)) report(path, member, source, memberName);
        if (member.type) checkMembers(member.type, memberName);
      }
    } else {
      ts.forEachChild(node, (child) => checkMembers(child, name));
    }
  };

  for (const statement of source.statements) {
    if (!isExported(statement) || ts.isExportDeclaration(statement)) {
      continue;
    }

    const name = declarationName(statement, source);
    if (!hasJsDoc(statement, source)) {
      report(path, statement, source, name);
    }

    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) checkMembers(statement, name);
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (declaration.type) checkMembers(declaration.type, declaration.name.getText(source));
      }
    }
  }
}

if (issues.length > 0) {
  throw new Error("Public API documentation is incomplete:\n" + issues.join("\n"));
}
