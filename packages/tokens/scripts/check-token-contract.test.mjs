import { checkTokenContract } from "./check-token-contract.mjs";

import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

const script = fileURLToPath(new URL("./check-token-contract.mjs", import.meta.url));
// The check reads this file as a source, so each legacy color is assembled here, and so is the name of the
// token a fixture sheet defines.
const legacy = {
  hex: ["#", "fff"].join(""),
  rgb: ["rgb", "(0 0 0)"].join(""),
  hsl: ["hsl", "(0 0% 0%)"].join(""),
  p3: ["color", "(display-p3 1 0 0)"].join(""),
};
const transparent = ["rgba", "(0, 0, 0, 0)"].join("");
const motionToken = ["--motion", "state"].join("-");
let root;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "token-contract-"));
  await mkdir(join(root, "src"));
  await mkdir(join(root, "docs"));
});

afterEach(() => rm(root, { recursive: true }));

/** Writes fixtures under the temporary root, keyed by their path. */
async function write(files) {
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
}

/** Checks fixtures, with every rule under src and the docs rules under docs. */
async function check(files) {
  await write(files);
  return checkTokenContract({ strict: ["src"], docs: ["docs"], cwd: root });
}

/** Runs the command over the fixtures' src directory. */
const run = (...flags) => spawnSync(process.execPath, [script, ...flags, "src"], { cwd: root, encoding: "utf8" });

/** Wraps lines in a rule of src/a.css, where the first one sits on line 2. */
const rule = (...lines) => ({ "src/a.css": [".a {", ...lines, "}"].join("\n") });

/** Reads a property in src/a.css that only the given source declares. */
const declaredBy = (path, source) => ({ ...rule("padding: var(--fixture-inset);"), [path]: source });

const cases = [
  // ---- Unknown token ----
  { name: "a token the package defines", files: rule("color: var(--color-text-primary);"), violations: [] },
  {
    name: "a misspelled token",
    files: rule("color: var(--color-text-primry);"),
    violations: ["src/a.css:2 unknown token"],
  },
  { name: "a var() with a fallback", files: rule("color: var(--fixture-optional, inherit);"), violations: [] },
  {
    name: "a property a stylesheet declares",
    files: declaredBy("src/b.css", ".b { --fixture-inset: var(--space-4); }"),
    violations: [],
  },
  {
    name: "a property a style directive declares",
    files: declaredBy("src/B.svelte", '<div style:--fixture-inset="var(--space-4)"></div>'),
    violations: [],
  },
  {
    name: "a property a style attribute declares",
    files: declaredBy("src/B.svelte", '<div style="--fixture-inset: var(--space-4)"></div>'),
    violations: [],
  },
  {
    name: "a property a script sets",
    files: declaredBy("src/b.ts", 'node.style.setProperty("--fixture-inset", inset);'),
    violations: [],
  },
  {
    name: "a property a document's style object declares",
    files: declaredBy("docs/b.mdx", '<div style={{ "--fixture-inset": inset }} />'),
    violations: [],
  },
  {
    name: "a property an installed uikit declares",
    files: declaredBy("node_modules/@a-novel-kit/uikit/dist/Card.svelte", "<style>.b { --fixture-inset: 0; }</style>"),
    violations: [],
  },
  {
    name: "a property only an ignored directory declares",
    files: declaredBy("src/dist/b.css", ".b { --fixture-inset: 0; }"),
    violations: ["src/a.css:2 unknown token"],
  },

  // ---- Text styles ----
  {
    name: "a text style, an inherited font and a weight token",
    files: rule(
      "font: var(--text-body);",
      "font: inherit;",
      "font-weight: var(--font-weight-bold);",
      "font-weight: inherit;"
    ),
    violations: [],
  },
  {
    name: "a font set by hand",
    files: rule(
      "font-size: var(--font-size-sm);",
      "line-height: 1.5;",
      "font-family: var(--font-family-mono);",
      "font-weight: 700;",
      "font: var(--font-weight-bold) 1rem / 1.5 serif;"
    ),
    violations: [2, 3, 4, 5, 6].map((line) => `src/a.css:${line} text style`),
  },

  // ---- Spacing ----
  {
    name: "spaces from the scale, the gutter, an edge and the component's own property",
    files: rule(
      "--fixture-inset: 7px;",
      "gap: var(--space-2) var(--space-4);",
      "padding: 0 var(--layout-gutter) 10%;",
      "margin: auto;",
      "margin-inline-end: calc(-1 * (var(--space-2) + var(--border-width-thin)));",
      "padding-block: var(--fixture-inset);"
    ),
    violations: [],
  },
  {
    name: "a space from a size or a raw length",
    files: rule(
      "gap: var(--size-2);",
      "padding: var(--control-height-sm);",
      "margin: var(--icon-size-sm);",
      "padding-inline: 4px;",
      "margin-block: round(1em, 1px);"
    ),
    violations: [2, 3, 4, 5, 6].map((line) => `src/a.css:${line} spacing`),
  },

  // ---- Sizes ----
  {
    name: "sizes from tokens, percentages, fluid units and keywords",
    files: rule(
      "inline-size: var(--size-4);",
      "block-size: 100%;",
      "max-inline-size: min(100vi, var(--layout-container-sm));",
      "min-inline-size: max(var(--fixture-anchor, 0px), 50cqi);",
      "flex: 1 1 0;",
      "width: fit-content;"
    ),
    violations: [],
  },
  {
    name: "a size from a space or a raw length",
    files: rule("inline-size: var(--space-4);", "block-size: 2rem;", "max-inline-size: 68ch;", "flex: 1 1 12rem;"),
    violations: [2, 3, 4, 5].map((line) => `src/a.css:${line} size`),
  },

  // ---- Scales ----
  {
    name: "a radius, a layer and a motion from their scales",
    files: rule(
      "border-radius: var(--radius-md);",
      "border-radius: calc(var(--radius-lg) - var(--space-1));",
      "border-radius: inherit;",
      "border-start-start-radius: 0;",
      "z-index: var(--layer-modal);",
      "z-index: -1;",
      "transition: color var(--duration-fast) var(--easing-standard);",
      "animation: spin calc(var(--duration-slow) * 4) linear infinite;",
      "transition: none;"
    ),
    violations: [],
  },
  {
    name: "a radius, a layer and a motion set by hand",
    files: rule(
      "border-radius: 4px;",
      "border-radius: var(--space-2);",
      "border-radius: 50%;",
      "z-index: 10;",
      "transition: color 200ms var(--easing-standard);",
      "transition: color var(--duration-fast) ease-out;",
      "animation-timing-function: cubic-bezier(0.2, 0, 0, 1);"
    ),
    violations: [2, 3, 4, 5, 6, 7, 8].map((line) => `src/a.css:${line} scale`),
  },
  {
    name: "a motion that reads another scale",
    files: rule("transition: color var(--space-1);"),
    violations: ["src/a.css:2 scale"],
  },
  {
    name: "a primitive palette token",
    files: rule("color: var(--color-brand-9);", "--fixture-fill: var(--base-brand);"),
    violations: ["src/a.css:2 scale", "src/a.css:3 scale"],
  },

  // ---- Bases ----
  { name: "a base in a custom property", files: rule("--fixture-size: calc(var(--size-base) * 3);"), violations: [] },
  { name: "a base in a property", files: rule("opacity: var(--opacity-base);"), violations: ["src/a.css:2 base"] },

  // ---- Calc ----
  {
    name: "a calc() that adds, negates, multiplies two properties, or scales the component's own",
    files: rule(
      "--fixture-columns: 3;",
      "--fixture-margin: var(--space-6);",
      "padding: calc(var(--space-3) - var(--space-1));",
      "margin: calc(var(--space-1) * -1) calc(-1 * var(--space-2));",
      "inline-size: calc(var(--fixture-columns) * var(--size-24));",
      "max-inline-size: calc(100vi - 2 * var(--fixture-margin));",
      "block-size: calc(100% / 3);"
    ),
    violations: [],
  },
  {
    name: "a calc() that scales a token by a number",
    files: rule(
      "padding-block: calc(var(--space-1) / 2);",
      "block-size: calc(var(--control-height-sm) * 3);",
      "inline-size: calc(2 * var(--size-4));"
    ),
    violations: [2, 3, 4].map((line) => `src/a.css:${line} calc`),
  },

  // ---- Breakpoints ----
  {
    name: "media queries at the breakpoints, other features and container queries",
    files: {
      "src/a.css": [
        "@media (min-width: 35rem) { .a { gap: var(--space-2); } }",
        "@media (width < 48rem) { .a { gap: var(--space-2); } }",
        "@media (35rem <= width < 48rem) { .a { gap: var(--space-2); } }",
        "@media (hover: hover) and (pointer: coarse) { .a { gap: var(--space-2); } }",
        "@container (width < 30rem) { .a { gap: var(--space-2); } }",
      ].join("\n"),
    },
    violations: [],
  },
  {
    name: "a media query at another width",
    files: {
      "src/a.css": [
        "@media (min-width: 40rem) { .a { gap: var(--space-2); } }",
        "@media screen and (width >= 768px) { .a { gap: var(--space-2); } }",
      ].join("\n"),
    },
    violations: ["src/a.css:1 breakpoint", "src/a.css:2 breakpoint"],
  },
  {
    name: "a media query under an exception",
    files: { "src/a.css": "/* off-scale: the frame's own width */\n@media (min-width: 60rem) { .a { margin: 0; } }" },
    violations: [],
  },

  // ---- Legacy color ----
  { name: "an OKLCH color", files: rule("color: oklch(0.7 0.1 232);"), violations: [] },
  {
    name: "a color outside OKLCH",
    files: rule(`color: ${legacy.hex};`, `color: ${legacy.rgb};`, `color: ${legacy.hsl};`, `color: ${legacy.p3};`),
    violations: [2, 3, 4, 5].map((line) => `src/a.css:${line} legacy color`),
  },
  {
    name: "a color outside OKLCH in a script, a document and a component's markup",
    files: {
      "src/theme.ts": `export const theme = {\n  canvas: "${legacy.hex}",\n};`,
      "docs/Colors.mdx": `# Colors\n\n<Swatch color="${legacy.rgb}" />`,
      "src/A.svelte": `<div style="color: ${legacy.hsl}"></div>`,
    },
    violations: ["docs/Colors.mdx:3 legacy color", "src/A.svelte:1 legacy color", "src/theme.ts:2 legacy color"],
  },
  {
    name: "sample colors in a test and a fixture",
    files: {
      "src/a.test.ts": `expect(color).toBe("${legacy.rgb}");`,
      "src/picture.fixture.ts": `export const fill = "${legacy.hex}";`,
    },
    violations: [],
  },
  {
    name: "the serialized transparent value in a story",
    files: { "src/a.stories.svelte": `<script>expect(background).toBe("${transparent}");</script>` },
    violations: [],
  },

  // ---- Documentation ----
  {
    name: "demo values and an exception in documentation",
    files: {
      "docs/a.css": [
        "@media (min-width: 40rem) {",
        "  /* off-scale: no rule to excuse here */",
        "  .a { padding: 4px; font-size: 12px; color: var(--color-brand-9); inline-size: calc(var(--size-base) * 3); }",
        "}",
      ].join("\n"),
    },
    violations: [],
  },
  {
    name: "an unknown token in documentation",
    files: { "docs/a.css": ".a { color: var(--color-text-primry); }" },
    violations: ["docs/a.css:1 unknown token"],
  },

  // ---- Exceptions ----
  {
    name: "an exception, for the declaration below it only",
    files: rule("/* off-scale: optical centering */", "margin-block: 1px;", "margin-inline: 1px;"),
    violations: ["src/a.css:4 spacing"],
  },
  {
    name: "an exception over an unknown token and a legacy color",
    files: rule(
      "/* off-scale: a demo */",
      "padding: var(--fixture-missing) 4px;",
      "/* off-scale: a demo */",
      `z-index: 10; color: ${legacy.hex};`
    ),
    violations: ["src/a.css:3 unknown token", "src/a.css:5 legacy color"],
  },
  {
    name: "an exception with no reason",
    files: rule("/* off-scale: */", "margin: 1px;"),
    violations: ["src/a.css:2 exception", "src/a.css:3 spacing"],
  },
  {
    name: "an exception over a declaration that breaks no rule",
    files: rule("/* off-scale: a stale reason */", "margin: 0;"),
    violations: ["src/a.css:2 unused exception"],
  },
  {
    name: "an exception above no declaration",
    files: {
      "src/a.css": [
        "/* off-scale: above a selector */",
        ".a {",
        "  margin: 0;",
        "  /* off-scale: before a brace */",
        "}",
        "/* off-scale: at the end */",
      ].join("\n"),
    },
    violations: [1, 4, 6].map((line) => `src/a.css:${line} unused exception`),
  },
  {
    name: "an exception after a declaration",
    files: rule("margin: 0; /* off-scale: a trailing note */", "padding: 1px;"),
    violations: ["src/a.css:2 unused exception", "src/a.css:3 spacing"],
  },
  {
    name: "an exception parted from its declaration by another comment",
    files: rule("/* off-scale: optical centering */", "/* A note. */", "margin: 1px;"),
    violations: ["src/a.css:2 unused exception", "src/a.css:4 spacing"],
  },

  // ---- Structure ----
  {
    name: "a declaration over several lines, and a nested rule",
    files: rule(
      "transition:",
      "  color var(--duration-fast) var(--easing-standard),",
      "  opacity 200ms ease;",
      "",
      "&:hover {",
      "  padding: 4px;",
      "}"
    ),
    violations: ["src/a.css:2 scale", "src/a.css:7 spacing"],
  },
  {
    name: "a component's style block",
    files: {
      "src/A.svelte": [
        "<!-- <style>.documented { padding: 1px; }</style> -->",
        "<script>",
        "  let { wide = false } = $props();",
        "</script>",
        "",
        '<div class="a" class:wide style="--fixture-inset: 0"></div>',
        "",
        "<style>",
        "  .a {",
        "    padding: var(--fixture-inset);",
        "    margin: 2px;",
        "  }",
        "</style>",
      ].join("\n"),
    },
    violations: ["src/A.svelte:11 spacing"],
  },
  {
    name: "a font face's descriptors",
    files: { "src/a.css": '@font-face { font-family: "Fixture"; font-weight: 700; }' },
    violations: [],
  },
  {
    name: "a stylesheet in an ignored directory",
    files: { "src/node_modules/package/a.css": ".a { padding: 4px; }", "src/dist/a.css": ".a { padding: 4px; }" },
    violations: [],
  },
];

describe("checkTokenContract", () => {
  it.each(cases)("$name", async ({ files, violations }) => {
    const found = await check(files);

    expect(found.violations.map(({ file, line, rule }) => `${file}:${line} ${rule}`)).toEqual(violations);
  });

  it("returns each exception with its reason, and counts the files it read", async () => {
    const found = await check({
      ...rule("/* off-scale: optical", "   centering */", "margin-block: 1px;"),
      "src/b.ts": "export {};",
    });

    expect(found.exceptions).toEqual([{ file: "src/a.css", line: 2, reason: "optical centering" }]);
    expect(found.files).toBe(2);
  });

  it("names the declaration and the family it takes", async () => {
    const found = await check(rule("padding-inline:", "  4px;"));

    expect(found.violations).toEqual([
      {
        file: "src/a.css",
        line: 2,
        rule: "spacing",
        declaration: "padding-inline: 4px",
        hint: "takes --space-*, --layout-gutter, a percentage or the component's own property",
      },
    ]);
  });

  it("keeps the mode of a directory nested in another", async () => {
    await write({ "src/a.css": ".a { padding: 4px; }", "src/stories/a.css": ".a { padding: 4px; }" });

    const found = await checkTokenContract({ strict: ["src"], docs: ["src/stories"], cwd: root });

    expect(found.violations.map(({ file }) => file)).toEqual(["src/a.css"]);
  });
});

describe("check-token-contract.mjs", () => {
  it("prints the files it checked and the exceptions on success", async () => {
    await write(rule("/* off-scale: optical centering */", "margin-block: 1px;"));

    expect(run()).toMatchObject({ status: 0, stdout: "Token contract: 1 file checked, 1 exception.\n" });
    expect(run("--list-exceptions").stdout).toContain("src/a.css:2 optical centering\n");
  });

  it("prints every violation with its hint and fails", async () => {
    await write(rule("z-index: 10;"));

    const { status, stderr } = run();

    expect(status).toBe(1);
    expect(stderr).toContain(
      "src/a.css:2: scale: z-index: 10 (takes --layer-*, or -1, 0 or 1 to order a component's own layers)\n"
    );
    expect(stderr).toContain("Token contract: 1 violation (scale 1), 1 file checked, 0 exceptions.\n");
  });

  it("holds the contract to the token sheets beside it, where a motion token sets a transition only", async () => {
    await write({
      "tokens/scripts/check.mjs": await readFile(script, "utf8"),
      "tokens/tokens.css": `:root { ${motionToken}: 100ms linear; }`,
      "tokens/colors.css": "",
      "tokens/canvas.css": "",
      ...rule(`transition: color var(${motionToken});`, `padding: var(${motionToken});`),
    });

    const { stderr } = spawnSync(process.execPath, ["tokens/scripts/check.mjs", "src"], {
      cwd: root,
      encoding: "utf8",
    });

    expect(stderr).not.toContain("src/a.css:2:");
    expect(stderr).toContain("src/a.css:3: spacing:");
  });
});
