/// <reference types="vite/client" />
import StickyBar from "./StickyBar.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const children = createRawSnippet(() => ({ render: () => "<span>Actions</span>" }));

/** Renders a bar on a page three screens tall, scrolled so the bar has left its place in the flow. */
function renderScrolled(edge: "start" | "end", variable: string) {
  const { container, getByText } = render(StickyBar, { edge, children });
  container.style.setProperty(variable, "24px");

  const filler = document.createElement("div");
  filler.style.blockSize = "300vb";
  if (edge === "start") container.append(filler);
  else container.prepend(filler);

  window.scrollTo({ top: window.innerHeight, behavior: "instant" });
  return getByText("Actions").parentElement!;
}

describe("StickyBar", () => {
  it("stays at the top of the page, under the shell's sticky top", () => {
    const bar = renderScrolled("start", "--shell-sticky-top");

    expect(bar.getBoundingClientRect().top).toBeCloseTo(24);
  });

  it("stays at the bottom of the page, over the shell's sticky bottom", () => {
    const bar = renderScrolled("end", "--shell-sticky-bottom");

    expect(bar.getBoundingClientRect().bottom).toBeCloseTo(window.innerHeight - 24);
  });

  it.each(["start", "end"] as const)(
    "frosts what scrolls under it at the %s edge through clear glass, with no line",
    (edge) => {
      const { getByText } = render(StickyBar, { edge, children });
      const css = getComputedStyle(getByText("Actions").parentElement!);

      expect(css.backdropFilter).toContain("blur");
      const clear = document.body.appendChild(document.createElement("span"));
      clear.style.backgroundColor = "transparent";
      expect(css.backgroundColor).toBe(getComputedStyle(clear).backgroundColor);
      expect([css.borderBlockStartWidth, css.borderBlockEndWidth]).toEqual(["0px", "0px"]);
    }
  );

  it.each([
    ["spans the page's gutters when it bleeds", true, 0],
    ["stays in the column otherwise", false, 16],
  ])("%s, with its content in the column", (_, bleed, inset) => {
    const { container, getByText } = render(StickyBar, { edge: "start", bleed, children });
    container.style.paddingInline = "16px";
    container.style.setProperty("--layout-gutter", "16px");

    const page = container.getBoundingClientRect();
    const content = getByText("Actions");
    const bar = content.parentElement!.getBoundingClientRect();
    expect(bar.left).toBeCloseTo(page.left + inset);
    expect(bar.right).toBeCloseTo(page.right - inset);
    expect(content.getBoundingClientRect().left).toBeCloseTo(page.left + 16);
  });
});
