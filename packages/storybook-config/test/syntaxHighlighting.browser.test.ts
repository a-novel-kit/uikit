import "../src/preview";
import { agoraTheme } from "../src/theme";

import { afterEach, expect, it } from "vitest";

import { CodeOrSourceMdx } from "@storybook/addon-docs/blocks";
import { createElement } from "react";
import { type Root, createRoot } from "react-dom/client";
import { ThemeProvider, convert } from "storybook/theming";

let root: Root | undefined;

afterEach(() => {
  root?.unmount();
  document.body.replaceChildren();
});

it.each([
  {
    language: "svelte",
    code: '<script lang="ts">\n  const label = "Save";\n</script>\n<Button>{label}</Button>\n<style>button { color: red; }</style>',
    tokens: [".tag", ".keyword", ".string", ".property"],
  },
  { language: "ts", code: 'const label: string = "Save";', tokens: [".keyword", ".string"] },
  { language: "html", code: '<button type="submit">Save</button>', tokens: [".tag", ".attr-name"] },
  { language: "text", code: "Plain text\n<not-markup>", tokens: [] },
])("renders $language documentation without changing its source text", async ({ language, code, tokens }) => {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  root.render(
    createElement(
      ThemeProvider,
      { theme: convert(agoraTheme) },
      createElement(CodeOrSourceMdx, { className: `language-${language}` }, code)
    )
  );

  await expect.poll(() => container.querySelector("pre.prismjs")?.textContent).toBe(code);
  const source = container.querySelector("pre.prismjs")!;
  for (const selector of tokens) {
    const token = source.querySelector(`.token${selector}`);
    expect(token).not.toBeNull();
    expect(getComputedStyle(token!).color).not.toBe(getComputedStyle(source).color);
  }
  if (tokens.length === 0) expect(source.querySelectorAll(".token")).toHaveLength(0);
});
