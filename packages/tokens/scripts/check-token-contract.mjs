#!/usr/bin/env node
// Holds CSS to the token contract: stylesheets and the style blocks of Svelte components read the tokens
// their properties take. A misspelled or removed custom property fails silently in the browser, so the
// check also fails on a token nothing defines.
//
//   uikit-token-contract [--docs <dir>]... [--list-exceptions] <dir>...
//
// Every rule holds under a directory. Stories and documentation show primitives and demo values, so under
// a --docs directory only the unknown token and legacy color rules hold. A directory nested in another
// keeps its own mode. A comment directly above a declaration, /* off-scale: <reason> */, exempts it from
// every other rule, and the check prints how many it let through. Scripts and documents are held to the
// legacy color rule too, tests and fixtures apart.
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";

const packageDirectory = resolve(import.meta.dirname, "..");
const ignoredDirectories = new Set([".svelte-kit", "coverage", "dist", "node_modules", "storybook-static"]);
const styleExtensions = new Set([".css", ".svelte"]);
// Scripts and documents declare custom properties and may hold a color, so they are read too.
const sourceExtensions = new Set([...styleExtensions, ".js", ".mdx", ".mjs", ".ts", ".tsx"]);

// A custom property is declared by a CSS declaration, a Svelte style directive, a component's style
// property, a key of a style object, a setProperty call or an @property rule.
const definitionPattern = /(?<![\w-])(--[\w-]+)["'`]?\s*[:=]|(?:setProperty\(\s*["'`]|@property\s+)(--[\w-]+)/g;
const legacyColorPattern = /#[0-9a-f]{3,8}\b|(?:rgb|rgba|hsl|hsla)\s*\(|color\s*\(\s*display-p3\b/i;
// How a browser serializes `transparent`: a value a story asserts, never an authored color.
const transparentPattern = /rgba\(0, 0, 0, 0\)/g;
// Tests and fixtures hold sample pictures and computed styles, which a browser serializes outside OKLCH.
const dataFilePattern = /\.(?:test|fixture)\.\w+$/;
// The generated palette lists the swatches as a custom color is stored, in hex. Its generator holds none.
const generatedPalette = resolve(packageDirectory, "palette.js");
const primitivePattern =
  /var\(\s*--(?:base-(?:brand|pressure|signal|neutral)|color-(?:neutral|brand|pressure|signal)-\d+)\s*[,)]/;
// The value every step of a scale multiplies.
const basePattern =
  /var\(\s*--(?:space|size|radius|border-width|duration|blur|opacity|color-mix|font-size)-base\s*[,)]/;
// A custom property multiplied or divided by a bare number, on either side.
const factorPattern =
  /var\(\s*(--[\w-]+)\s*\)\s*[*/]\s*(-?\d*\.?\d+)(?![\w.%])|(?<![\w.%)-])(-?\d*\.?\d+)\s*\*\s*var\(\s*(--[\w-]+)/g;
const easingPattern =
  /(?<![\w-])(?:(?:ease(?:-in)?(?:-out)?|step-start|step-end)(?![\w-])|(?:cubic-bezier|steps|linear)\()/;
// A size may follow its container or the viewport: these units need no token.
const fluidUnitPattern = /^(?:|%|fr|[sld]?v(?:w|h|i|b|min|max)|cq(?:w|h|i|b|min|max))$/;
// The blocks of these rules hold descriptors, which no token governs.
const descriptorRulePattern = /^\s*@(?:font-face|property|page|counter-style|font-palette-values|view-transition)\b/;
// A comment, a string, a character that ends a statement or nests a value, or the text between them.
const cssTokenPattern =
  /\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\\n])*"|'(?:\\[\s\S]|[^'\\\n])*'|[{};()]|[^/"'{};()]+|[/"']/g;
const declarationPattern = /^\s*([\w-]+)\s*:\s*([\s\S]*?)\s*$/;
const mediaRulePattern = /^\s*(@media)\b\s*([\s\S]*?)\s*$/;

/**
 * The viewport widths a media query may branch on. A media condition reads no custom property, so no token
 * holds them.
 */
const breakpoints = new Set([
  // Where an action group stops stacking.
  "35rem",
  // Where a page stops being a phone layout.
  "48rem",
]);

/** Lists the custom properties a source declares. */
const declaredProperties = (source) => Array.from(source.matchAll(definitionPattern), (match) => match[1] ?? match[2]);

const tokenSheets = ["tokens.css", "colors.css", "canvas.css"].map((name) =>
  readFile(resolve(packageDirectory, name), "utf8")
);
/** The custom properties the tokens package defines. Any other custom property is a component's own. */
const tokenNames = new Set((await Promise.all(tokenSheets)).flatMap(declaredProperties));

/** Lists the custom properties a value reads through var(). */
const reads = (value) => Array.from(value.matchAll(/var\(\s*(--[\w-]+)/g), (match) => match[1]);

/** Reports whether a value reads only tokens of a family and the component's own properties. */
const readsOnly = (value, family) => reads(value).every((name) => family.test(name) || !tokenNames.has(name));

/** Reports whether a value is `inherit`, or one var() that {@link readsOnly} accepts. */
const takesOne = (value, family) =>
  value === "inherit" || (/^var\(\s*--[\w-]+\s*\)$/.test(value) && readsOnly(value, family));

/** Lists the numbers a value holds, each with its unit. A custom property's name holds none. */
function numbers(value) {
  const matches = value.replace(/--[\w-]+/g, " ").matchAll(/(?<![\w.#-])(-?(?:\d+\.?\d*|\.\d+))([a-z%]*)/gi);
  return Array.from(matches, ([, number, unit]) => ({ number: Number(number), unit: unit.toLowerCase() }));
}

/** Reports whether every number of a value is zero or carries a unit the pattern accepts. */
const measuresIn = (value, units) => numbers(value).every(({ number, unit }) => number === 0 || units.test(unit));

/**
 * Reports whether a value scales a token by a number. Negating one, with -1, scales nothing, and a
 * component's own property times a number is geometry, as twice a dialog's margin.
 */
const scales = (value) =>
  Array.from(value.matchAll(factorPattern)).some(
    ([, dividend, divisor, factor, multiplicand]) =>
      tokenNames.has(dividend ?? multiplicand) && Number(divisor ?? factor) !== -1
  );

/** Reports whether every width a media query branches on is one of the {@link breakpoints}. */
const keepsBreakpoints = (condition) =>
  Array.from(condition.matchAll(/\([^()]*\bwidth\b[^()]*\)/g)).every(([feature]) =>
    numbers(feature).every(({ number, unit }) => breakpoints.has(`${number}${unit}`))
  );

/**
 * The token families. Each names the properties it governs, tells whether one of their values keeps to
 * the family, and gives the hint a violation prints. A stepped family takes its scale's steps as they
 * are: a calc() adds, subtracts or negates them, and scales none.
 */
const families = [
  {
    rule: "text style",
    properties: /^(?:font-size|line-height|font-family)$/,
    allows: () => false,
    hint: "a text style sets it, with font: var(--text-*)",
  },
  {
    rule: "text style",
    properties: /^font$/,
    allows: (value) => takesOne(value, /^--text-/),
    hint: "takes var(--text-*) or inherit",
  },
  {
    rule: "text style",
    properties: /^font-weight$/,
    allows: (value) => takesOne(value, /^--font-weight-/),
    hint: "takes var(--font-weight-*) or inherit",
  },
  {
    rule: "spacing",
    properties: /^(?:(?:row-|column-)?gap|(?:padding|margin)(?:-[a-z-]+)?)$/,
    stepped: true,
    // A border's or a focus ring's width compensates an edge inside a calc().
    allows: (value) =>
      readsOnly(value, /^--(?:space-|layout-gutter$|border-width-|focus-ring-)/) && measuresIn(value, /^%?$/),
    hint: "takes --space-*, --layout-gutter, a percentage or the component's own property",
  },
  {
    rule: "size",
    properties: /^(?:(?:min-|max-)?(?:inline-size|block-size|width|height)|flex-basis|flex)$/,
    stepped: true,
    allows: (value) => !reads(value).some((name) => name.startsWith("--space-")) && measuresIn(value, fluidUnitPattern),
    hint: "takes --size-*, --control-height-*, --icon-size-*, --layout-*, a percentage or a viewport unit",
  },
  {
    rule: "scale",
    properties: /^border-(?:[a-z-]+-)?radius$/,
    // A nested shape takes the outer radius less the space between them.
    allows: (value) =>
      readsOnly(value, value.includes("calc(") ? /^--(?:radius|space)-/ : /^--radius-/) && measuresIn(value, /^$/),
    hint: "takes --radius-*, inherit or 0",
  },
  {
    rule: "scale",
    properties: /^z-index$/,
    allows: (value) =>
      readsOnly(value, /^--layer-/) && numbers(value).every(({ number }) => [-1, 0, 1].includes(number)),
    hint: "takes --layer-*, or -1, 0 or 1 to order a component's own layers",
  },
  {
    rule: "scale",
    properties: /^(?:transition|animation)(?:-[a-z-]+)?$/,
    allows: (value) =>
      readsOnly(value, /^--(?:duration|easing|motion)-/) &&
      !easingPattern.test(value) &&
      measuresIn(value, /^(?!m?s$)/),
    hint: "a time takes --duration-*, an easing --easing-* or linear, and --motion-* sets both",
  },
];

/** Replaces every character of a text but its line breaks with a space, so what follows keeps its line. */
const blank = (text) => text.replace(/[^\n]/g, " ");

/** Returns a component's style blocks with everything around them blanked. */
function styleBlocks(component) {
  const markup = component.replace(/<!--[\s\S]*?-->/g, blank);
  let css = "";

  for (const block of markup.matchAll(/(?<=<style[^>]*>)[\s\S]*?(?=<\/style>)/g)) {
    css += blank(markup.slice(css.length, block.index)) + block[0];
  }

  return css;
}

/** Returns a lookup from an offset of a text to its line. Offsets are asked in increasing order. */
function lineCounter(text) {
  let line = 1;
  let position = 0;

  return (offset) => {
    for (; position < offset; position++) if (text[position] === "\n") line++;
    return line;
  };
}

/** Reads the reason of an `off-scale:` comment. Any other comment has none. */
const offScaleReason = (comment) => /^\/\*\s*off-scale:([\s\S]*)\*\/$/.exec(comment)?.[1].trim().replace(/\s+/g, " ");

/**
 * Yields each declaration of a stylesheet with its line, and the exception an `off-scale:` comment directly
 * above grants it. A media rule comes the same way, as the `@media` property with its condition for value.
 * Any other statement that ends at a brace, such as a selector, is skipped. An exception above none of
 * them comes alone.
 */
function* statements(css) {
  const lineOf = lineCounter(css);
  // The statement being read, without its comments, and the line it starts on.
  let statement = "";
  let line = 0;
  // A semicolon inside parentheses, as in a data URL, ends no statement.
  let depth = 0;
  let exception;
  let inDescriptors = false;

  for (const { 0: token, index } of css.matchAll(cssTokenPattern)) {
    const isBlank = statement.trim() === "";

    if (token.startsWith("/*")) {
      const reason = offScaleReason(token);
      const comment = reason === undefined ? undefined : { line: lineOf(index), reason };
      const startsLine = css.slice(css.lastIndexOf("\n", index - 1) + 1, index).trim() === "";

      // A comment on its own line parts an earlier exception from the declaration below it. An exception
      // after a declaration, or inside one, is above nothing.
      if (isBlank && startsLine) {
        if (exception !== undefined) yield { exception };
        exception = comment;
      } else if (comment !== undefined) yield { exception: comment };

      statement += " ";
      continue;
    }

    if (token !== "{" && token !== "}" && (token !== ";" || depth > 0)) {
      if (isBlank && token.trim() !== "") line = lineOf(index + token.search(/\S/));
      depth += Number(token === "(") - Number(token === ")");
      statement += token;
      continue;
    }

    const [, property, value] = (token === "{" ? mediaRulePattern : declarationPattern).exec(statement) ?? [];
    if (property !== undefined && !inDescriptors) {
      yield { property, value: value.replace(/\s+/g, " "), line, exception };
    } else if (exception !== undefined) yield { exception };

    if (token !== ";") inDescriptors = token === "{" && descriptorRulePattern.test(statement);
    [statement, depth, exception] = ["", 0, undefined];
  }

  if (exception !== undefined) yield { exception };
}

/** Lists what a statement breaks among the rules an exception may excuse. */
function breaches(property, code) {
  const found = [];

  if (property === "@media" && !keepsBreakpoints(code)) {
    found.push({ rule: "breakpoint", hint: `a viewport breaks at ${[...breakpoints].join(" or ")}` });
  }
  if (primitivePattern.test(code)) {
    found.push({ rule: "scale", hint: "takes a semantic token: a primitive stays in the tokens package" });
  }
  // A custom property's definition is held to no family: the property that reads it is.
  if (property.startsWith("--")) return found;

  if (basePattern.test(code)) {
    found.push({ rule: "base", hint: "a base is multiplied in tokens.css only; use a step or add a token" });
  }

  const family = families.find(({ properties }) => properties.test(property));
  if (family !== undefined && !family.allows(code)) found.push({ rule: family.rule, hint: family.hint });
  if (family?.stepped && scales(code)) {
    found.push({ rule: "calc", hint: "a calc() adds, subtracts or negates a token, and scales none by a number" });
  }

  return found;
}

/** Checks a stylesheet, and returns what breaks the contract with the exceptions it grants. */
function checkStyles(css, defined, docsOnly) {
  const violations = [];
  const exceptions = [];

  for (const { property, value = "", line, exception } of statements(css)) {
    const declaration = property === "@media" ? `@media ${value}` : `${property}: ${value}`;
    // A string or a URL holds no token.
    const code = value
      .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '""')
      .replace(/url\([^)]*\)/g, "url()")
      .replace(/\s*!important$/i, "");

    for (const [, name] of code.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
      if (!defined.has(name)) {
        violations.push({ line, rule: "unknown token", declaration, hint: `nothing defines ${name}` });
      }
    }

    if (docsOnly) continue;

    const excusable = property === undefined ? [] : breaches(property, code);
    if (exception === undefined || exception.reason === "") {
      violations.push(...excusable.map((breach) => ({ line, declaration, ...breach })));
    }
    if (exception === undefined) continue;

    const comment = { line: exception.line, declaration: `/* off-scale: ${exception.reason} */`.replace(/\s+/g, " ") };
    if (exception.reason === "") {
      violations.push({ ...comment, rule: "exception", hint: "an exception states its reason" });
    } else if (excusable.length === 0) {
      violations.push({ ...comment, rule: "unused exception", hint: "nothing under it breaks a rule" });
    } else exceptions.push(exception);
  }

  return { violations, exceptions };
}

/** Lists the lines of a source that hold a color literal outside OKLCH. */
function legacyColors(source) {
  const violations = [];
  const hint = "a color is authored in OKLCH and read through a token";

  for (const [index, text] of source.split(/\r?\n/).entries()) {
    if (legacyColorPattern.test(text.replace(transparentPattern, ""))) {
      violations.push({ line: index + 1, rule: "legacy color", declaration: text.trim(), hint });
    }
  }

  return violations;
}

/** Lists the source files under a directory. */
async function sourceFiles(root) {
  const files = [];
  const pending = [root];

  while (pending.length > 0) {
    const directory = pending.pop();

    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);

      if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) pending.push(path);
      if (entry.isFile() && sourceExtensions.has(extname(entry.name))) files.push(path);
    }
  }

  return files;
}

/**
 * Checks the stylesheets and Svelte style blocks under each directory against the token contract, and
 * every source file for a legacy color. Every rule holds under a `strict` directory, and only the unknown
 * token and legacy color rules under a `docs` one. Paths resolve against `cwd`, where the built components
 * of an installed uikit are also read for the custom properties they declare.
 *
 * Returns the number of files checked, the violations, and the `off-scale:` exceptions granted.
 */
export async function checkTokenContract({ strict = [], docs = [], cwd = process.cwd() }) {
  const roots = [
    ...strict.map((directory) => ({ directory: resolve(cwd, directory), docsOnly: false })),
    ...docs.map((directory) => ({ directory: resolve(cwd, directory), docsOnly: true })),
  ];
  // A nested directory is read after the one that holds it, so its files keep its own mode.
  roots.sort((left, right) => left.directory.length - right.directory.length);

  const modes = new Map();
  for (const { directory, docsOnly } of roots) {
    for (const path of await sourceFiles(directory)) modes.set(path, docsOnly);
  }

  const uikit = resolve(cwd, "node_modules/@a-novel-kit/uikit/dist");
  const sources = new Map();
  for (const path of [...modes.keys(), ...(existsSync(uikit) ? await sourceFiles(uikit) : [])]) {
    sources.set(path, await readFile(path, "utf8"));
  }

  const defined = new Set([...tokenNames, ...[...sources.values()].flatMap(declaredProperties)]);
  const report = { files: modes.size, violations: [], exceptions: [] };

  for (const path of [...modes.keys()].sort()) {
    const source = sources.get(path);
    const css = path.endsWith(".svelte") ? styleBlocks(source) : source;
    const styles = styleExtensions.has(extname(path)) ? checkStyles(css, defined, modes.get(path)) : undefined;
    const colors = dataFilePattern.test(path) || path === generatedPalette ? [] : legacyColors(source);
    const violations = [...colors, ...(styles?.violations ?? [])];
    const file = relative(cwd, path);

    violations.sort((left, right) => left.line - right.line);
    report.violations.push(...violations.map((violation) => ({ file, ...violation })));
    report.exceptions.push(...(styles?.exceptions ?? []).map((exception) => ({ file, ...exception })));
  }

  return report;
}

/** Counts a noun, in the plural unless there is one. */
const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;

/** Runs the check from the command line: prints its report, and fails on a violation. */
async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { docs: { type: "string", multiple: true, default: [] }, "list-exceptions": { type: "boolean" } },
  });

  if (positionals.length + values.docs.length === 0) {
    console.error("Usage: uikit-token-contract [--docs <dir>]... [--list-exceptions] <dir>...");
    process.exitCode = 2;
    return;
  }

  const { files, violations, exceptions } = await checkTokenContract({ strict: positionals, docs: values.docs });
  const summary = `${plural(files, "file")} checked, ${plural(exceptions.length, "exception")}`;

  if (values["list-exceptions"]) {
    for (const { file, line, reason } of exceptions) console.log(`${file}:${line} ${reason}`);
  }

  if (violations.length === 0) {
    console.log(`Token contract: ${summary}.`);
    return;
  }

  for (const { file, line, rule, declaration, hint } of violations) {
    console.error(`${file}:${line}: ${rule}: ${declaration} (${hint})`);
  }

  const counts = Object.entries(Object.groupBy(violations, ({ rule }) => rule)).map(
    ([rule, found]) => `${rule} ${found.length}`
  );
  console.error(`Token contract: ${plural(violations.length, "violation")} (${counts.join(", ")}), ${summary}.`);
  process.exitCode = 1;
}

if (import.meta.main) await main();
