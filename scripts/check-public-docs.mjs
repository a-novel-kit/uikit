// Fails when the public API of a published package lacks documentation: an exported declaration or
// one of its members without JSDoc, or a public component without an @component comment.
import { readFile, readdir } from "node:fs/promises";
import { basename, extname, relative, resolve } from "node:path";

import ts from "typescript";

const repositoryRoot = resolve(import.meta.dirname, "..");
const publicRoots = [
  resolve(repositoryRoot, "packages/uikit/src/lib"),
  resolve(repositoryRoot, "packages/icons/src/lib"),
  resolve(repositoryRoot, "packages/storybook-config/src"),
];
const explicitSources = [resolve(repositoryRoot, "packages/tokens/palette.d.ts")];
const ignoredNames = new Set(["app.d.ts"]);
const sourceExtensions = new Set([".svelte", ".ts", ".tsx"]);
const issues = [];

function isPublicSource(path) {
  const name = basename(path);
  return (
    sourceExtensions.has(extname(name)) &&
    !name.includes(".test.") &&
    !name.includes(".spec.") &&
    !ignoredNames.has(name)
  );
}

async function collectSources(root) {
  const names = await readdir(root, { recursive: true });
  return names.map((name) => resolve(root, name)).filter(isPublicSource);
}

/** Reports whether a barrel statement re-exports a Svelte module's default export. */
function isComponentReexport(statement) {
  return (
    ts.isExportDeclaration(statement) &&
    statement.moduleSpecifier !== undefined &&
    ts.isStringLiteral(statement.moduleSpecifier) &&
    statement.moduleSpecifier.text.endsWith(".svelte") &&
    statement.exportClause !== undefined &&
    ts.isNamedExports(statement.exportClause) &&
    statement.exportClause.elements.some((entry) => entry.propertyName?.text === "default")
  );
}

const hasJsDoc = (node, source) =>
  /\/\*\*[\s\S]*?\*\/\s*$/.test(source.text.slice(node.getFullStart(), node.getStart(source)));

const isExported = (node) =>
  ts.isExportAssignment(node) || node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);

function declarationName(node, source) {
  if (ts.isVariableStatement(node)) {
    return node.declarationList.declarations.map((declaration) => declaration.name.getText(source)).join(", ");
  }
  if (ts.isExportAssignment(node)) return "default export";
  return node.name?.getText(source) ?? "export";
}

function reportMissingJsDoc(path, node, source, name) {
  const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
  issues.push(relative(repositoryRoot, path) + ":" + (line + 1) + ": missing JSDoc for " + name);
}

/** Checks every member of the interfaces and object types nested in a declaration. */
function checkMembers(path, source, node, name) {
  if (!ts.isInterfaceDeclaration(node) && !ts.isTypeLiteralNode(node)) {
    ts.forEachChild(node, (child) => checkMembers(path, source, child, name));
    return;
  }

  for (const member of node.members) {
    const memberName = name + "." + (member.name?.getText(source) ?? "member");
    if (!hasJsDoc(member, source)) reportMissingJsDoc(path, member, source, memberName);
    if (member.type) checkMembers(path, source, member.type, memberName);
  }
}

/** Checks the exported declarations of one module and their members. */
function checkModule(path, moduleScript) {
  const kind = path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(path, moduleScript, ts.ScriptTarget.Latest, true, kind);

  for (const statement of source.statements) {
    if (!isExported(statement) || ts.isExportDeclaration(statement)) continue;

    const name = declarationName(statement, source);
    if (!hasJsDoc(statement, source)) reportMissingJsDoc(path, statement, source, name);

    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
      checkMembers(path, source, statement, name);
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (declaration.type) checkMembers(path, source, declaration.type, declaration.name.getText(source));
      }
    }
  }
}

const sources = [...explicitSources];
const publicComponents = new Set();
for (const root of publicRoots) {
  sources.push(...(await collectSources(root)));
  const barrel = ts.createSourceFile(
    "index.ts",
    await readFile(resolve(root, "index.ts"), "utf8"),
    ts.ScriptTarget.Latest
  );
  for (const statement of barrel.statements.filter(isComponentReexport)) {
    publicComponents.add(resolve(root, statement.moduleSpecifier.text));
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
  if (moduleScript !== undefined) checkModule(path, moduleScript);
}

if (issues.length > 0) {
  throw new Error("Public API documentation is incomplete:\n" + issues.join("\n"));
}
