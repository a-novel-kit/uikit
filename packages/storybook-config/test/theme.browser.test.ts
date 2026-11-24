import { aNovelTheme } from "../src/theme";

import { afterEach, describe, expect, it } from "vitest";

import { colorSystem } from "@a-novel-kit/uikit-tokens/palette";
import "@a-novel-kit/uikit-tokens/tokens.css";

import Color from "colorjs.io";

afterEach(() => document.body.replaceChildren());

// Sample browser-painted sRGB; a separate gamut mapper can overestimate text contrast. Each layer
// paints over the previous one, as a translucent surface does over its backdrop.
function renderedColor(...layers: string[]) {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("Canvas is required to sample rendered colors");
  for (const layer of layers) {
    context.fillStyle = layer;
    context.fillRect(0, 0, 1, 1);
  }
  const channels = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
  return new Color(
    "srgb",
    channels.map((channel) => channel / 255)
  );
}

/** The canvas as the browser computes it: a translucent surface, such as a card's glass, paints over it. */
function canvasColor() {
  const element = document.body.appendChild(document.createElement("span"));
  element.style.backgroundColor = "var(--color-surface-canvas)";
  return getComputedStyle(element).backgroundColor;
}

function sample(background: string, foreground = "--color-text-primary") {
  const element = document.createElement("span");
  element.style.backgroundColor = `var(${background})`;
  element.style.color = `var(${foreground})`;
  document.body.append(element);
  const style = getComputedStyle(element);
  return {
    background: renderedColor(canvasColor(), style.backgroundColor),
    foreground: renderedColor(style.color),
  };
}

describe("shared dark theme", () => {
  it("renders the agreed blue-black canvas in CSS, palette metadata, and Storybook chrome", () => {
    const canvas = sample("--color-surface-canvas").background;
    const colors = [canvas, new Color(colorSystem.canvas)];
    for (const value of [aNovelTheme.appBg, aNovelTheme.appContentBg, aNovelTheme.appPreviewBg]) {
      expect(value).toBeDefined();
      colors.push(new Color(value!));
    }
    for (const color of colors) {
      expect(color.to("srgb").coords.map((channel) => Math.round(channel * 255))).toEqual([3, 7, 10]);
    }
  });

  it.each(["info", "success", "warning", "error"])("keeps %s feedback readable on a subdued surface", (tone) => {
    const { background, foreground } = sample(`--color-feedback-${tone}-surface`, `--color-feedback-${tone}-text`);
    expect(foreground.contrast(background, "WCAG21")).toBeGreaterThanOrEqual(colorSystem.contrast.minimumNormalText);
    expect(background.oklch.l).toBeGreaterThan(sample("--color-surface-canvas").background.oklch.l);
    expect(background.oklch.l).toBeLessThan(sample("--color-surface-island-strong").background.oklch.l);
  });

  it.each(["canvas", "island-glass", "island-strong"])(
    "keeps selected text readable on %s through its veil",
    (surface) => {
      const element = document.createElement("span");
      element.style.backgroundColor = `var(--color-surface-${surface})`;
      element.style.color = "var(--color-selection-surface)";
      document.body.append(element);
      const style = getComputedStyle(element);
      const background = renderedColor(canvasColor(), style.backgroundColor, style.color);
      const foreground = sample("--color-surface-canvas", "--color-selection-text").foreground;
      expect(foreground.contrast(background, "WCAG21")).toBeGreaterThanOrEqual(5);
    }
  );

  // The lamp is brightest in the viewport's corner, where navigation sits; a card that holds a field starts further
  // out, where at most three quarters of the peak reaches it.
  it.each([
    ["ember", "var(--color-lamp-amber)"],
    ["magenta", "var(--base-pressure)"],
    ["brand", "var(--base-brand)"],
    ["signal", "var(--base-signal)"],
  ])("keeps a field hint readable on a frosted card under the %s lamp", (_, lamp) => {
    const layers = [
      "var(--color-surface-canvas)",
      `color-mix(in oklab, ${lamp} calc(var(--lamp-peak) * 0.75), transparent)`,
      "var(--color-surface-island-glass)",
    ].map((layer) => {
      const element = document.body.appendChild(document.createElement("span"));
      element.style.backgroundColor = layer;
      return getComputedStyle(element).backgroundColor;
    });
    const background = renderedColor(...layers);
    const { foreground } = sample("--color-surface-canvas", "--color-text-muted");
    expect(foreground.contrast(background, "WCAG21")).toBeGreaterThanOrEqual(4.8);
  });

  it.each(["canvas", "island-glass", "island-strong"])(
    "keeps field errors readable on %s with contrast headroom",
    (surface) => {
      const { background, foreground } = sample(`--color-surface-${surface}`, "--color-feedback-error-text");
      expect(foreground.contrast(background, "WCAG21")).toBeGreaterThanOrEqual(5);
    }
  );
});

// A hue's ink is its neon, written on its tint by a tag and a colored action, and on any surface by a text action.
describe("ink and tint", () => {
  const hues = ["brand", "pressure", "signal"] as const;
  const surfaces = ["canvas", "island-glass", "island-strong"] as const;

  it.each(hues)("keeps the %s ink readable on its tint with contrast headroom", (hue) => {
    const { background, foreground } = sample(`--color-tint-${hue}`, `--color-ink-${hue}`);
    expect(foreground.contrast(background, "WCAG21")).toBeGreaterThanOrEqual(4.8);
  });

  it.each(hues.flatMap((hue) => surfaces.map((surface) => [hue, surface] as const)))(
    "keeps the %s ink readable on %s with contrast headroom",
    (hue, surface) => {
      const { background, foreground } = sample(`--color-surface-${surface}`, `--color-ink-${hue}`);
      expect(foreground.contrast(background, "WCAG21")).toBeGreaterThanOrEqual(5);
    }
  );

  // A tint is a color, never a tinted gray: it holds several times a neutral surface's chroma.
  it.each(hues)("keeps the %s tint saturated", (hue) => {
    const tint = sample(`--color-tint-${hue}`).background;
    expect(tint.oklch.c).toBeGreaterThan(sample("--color-surface-island-strong").background.oklch.c * 4);
  });

  // The pointer lifts an action's fill one step, and the primary action's gradient one more at its top.
  it.each([
    ["primary", "--color-action-primary-hover"],
    ["primary", "--color-brand-5"],
    ["danger", "--color-action-danger-hover"],
  ])("keeps a %s action readable under the pointer on %s", (role, fill) => {
    const { background, foreground } = sample(fill, `--color-action-${role}-foreground-hover`);
    expect(foreground.contrast(background, "WCAG21")).toBeGreaterThanOrEqual(colorSystem.contrast.minimumNormalText);
  });
});
