/// <reference types="vite/client" />
import Badge from "./Badge.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

describe("Badge reflow", () => {
  it("preserves authored casing and fits its content inside a stretched layout", () => {
    const { container, getByText } = render(Badge, {
      children: createRawSnippet(() => ({ render: () => "<span>Member</span>" })),
    });
    container.style.cssText = "display: grid; text-transform: uppercase; letter-spacing: 0.1em";
    const content = getByText("Member");
    const badge = content.parentElement!;
    const css = getComputedStyle(badge);
    expect(css.textTransform).toBe("none");
    expect(css.letterSpacing).toBe("normal");
    expect(parseFloat(css.fontSize)).toBeGreaterThan(14);
    expect(badge.getBoundingClientRect().width).toBeCloseTo(content.getBoundingClientRect().width + 24);
  });

  it("keeps internal padding when a long role wraps", async () => {
    await page.viewport(320, 800);
    const text = "workspace:collaborative-story-creator";
    const { getByText } = render(Badge, {
      style: "max-inline-size: 12rem",
      children: createRawSnippet(() => ({ render: () => `<span>${text}</span>` })),
    });
    const content = getByText(text);
    const badge = content.parentElement!;
    const css = getComputedStyle(badge);
    expect(parseFloat(css.paddingBlockStart)).toBe(4);
    expect(parseFloat(css.paddingBlockEnd)).toBe(4);
    expect(parseFloat(css.paddingInlineStart)).toBe(12);
    expect(parseFloat(css.paddingInlineEnd)).toBe(12);
    expect(content.getBoundingClientRect().height).toBeGreaterThan(parseFloat(css.lineHeight));
    expect(badge.scrollWidth).toBeLessThanOrEqual(badge.clientWidth);
  });
});
