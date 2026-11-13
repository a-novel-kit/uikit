/// <reference types="vite/client" />
import Badge from "./Badge.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it, onTestFinished } from "vitest";
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
    expect(parseFloat(css.fontSize)).toBeGreaterThanOrEqual(12);
    expect(parseFloat(css.fontSize)).toBeLessThan(13);
    expect(badge.getBoundingClientRect().height).toBeLessThan(20);
    expect(badge.getBoundingClientRect().width).toBeCloseTo(content.getBoundingClientRect().width + 12);
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
    expect(parseFloat(css.paddingBlockStart)).toBe(2);
    expect(parseFloat(css.paddingBlockEnd)).toBe(2);
    expect(parseFloat(css.paddingInlineStart)).toBe(6);
    expect(parseFloat(css.paddingInlineEnd)).toBe(6);
    expect(content.getBoundingClientRect().height).toBeGreaterThan(parseFloat(css.lineHeight));
    expect(badge.scrollWidth).toBeLessThanOrEqual(badge.clientWidth);
  });

  it("keeps short status words intact in a narrow table column", () => {
    const table = document.createElement("table");
    table.style.inlineSize = "10rem";
    const row = table.insertRow();
    row.insertCell().textContent = "Production";
    const cell = row.insertCell();
    row.insertCell().textContent = "Yesterday";
    document.body.append(table);
    try {
      const { getByText } = render(Badge, {
        target: cell,
        props: { children: createRawSnippet(() => ({ render: () => "<span>Healthy</span>" })) },
      });
      const content = getByText("Healthy");
      expect(content.getBoundingClientRect().height).toBeLessThanOrEqual(
        parseFloat(getComputedStyle(content).lineHeight)
      );
    } finally {
      table.remove();
    }
  });
});

describe("Badge surfaces", () => {
  it.each(["neutral", "brand", "success", "warning", "danger"] as const)(
    "keeps the %s fill distinct and consistent across backdrops",
    (tone) => {
      const { container, getByText } = render(Badge, {
        tone,
        children: createRawSnippet(() => ({ render: () => "<span>Status</span>" })),
      });
      const badge = getByText("Status").parentElement!;
      const background = getComputedStyle(badge).backgroundColor;
      for (const surface of ["canvas", "raised", "overlay"]) {
        container.style.backgroundColor = `var(--color-surface-${surface})`;
        expect(getComputedStyle(badge).backgroundColor).toBe(background);
        expect(background).not.toBe(getComputedStyle(container).backgroundColor);
      }
    }
  );
});

/** Paints a CSS color on a canvas and reads the sRGB the browser shows, gamut mapping included. */
function painted(color: string) {
  const context = document.createElement("canvas").getContext("2d")!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
}

/** WCAG 2 relative luminance of a painted sRGB color. */
function luminance(channels: number[]) {
  return channels
    .map((channel) => channel / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

/** WCAG 2 contrast ratio of two painted sRGB colors. */
function contrast(first: number[], second: number[]) {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

describe("Badge fill", () => {
  const tones = ["neutral", "brand", "accent", "highlight", "success", "warning", "danger"] as const;

  it.each(tones)("keeps its text readable on the %s fill", (tone) => {
    const { getByText } = render(Badge, {
      tone,
      children: createRawSnippet(() => ({ render: () => "<span>Label</span>" })),
    });
    const css = getComputedStyle(getByText("Label").parentElement!);
    expect(contrast(painted(css.backgroundColor), painted(css.color))).toBeGreaterThanOrEqual(4.5);
  });

  // The genre and tag tones glared as solid accents: their fill is a deep shade of the same hue, near the canvas.
  it.each([
    ["accent", "--color-accent-secondary"],
    ["brand", "--color-feedback-info-text"],
  ] as const)("fills the %s tone deeper than its accent", (tone, accent) => {
    const { getByText } = render(Badge, {
      tone,
      children: createRawSnippet(() => ({ render: () => "<span>Label</span>" })),
    });
    const fill = painted(getComputedStyle(getByText("Label").parentElement!).backgroundColor);
    const probe = document.body.appendChild(document.createElement("span"));
    onTestFinished(() => probe.remove());
    probe.style.backgroundColor = `var(${accent})`;
    const full = painted(getComputedStyle(probe).backgroundColor);

    expect(luminance(fill)).toBeLessThan(luminance(full) * 0.75);
  });
});
