import { agoraTheme } from "../src/theme";

import { afterEach, describe, expect, it } from "vitest";

import { colorSystem } from "@a-novel-kit/uikit-tokens/palette";
import "@a-novel-kit/uikit-tokens/tokens.css";

import Color from "colorjs.io";

afterEach(() => document.body.replaceChildren());

// Sample browser-painted sRGB; a separate gamut mapper can overestimate text contrast.
function renderedColor(color: string) {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("Canvas is required to sample rendered colors");
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const channels = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
  return new Color(
    "srgb",
    channels.map((channel) => channel / 255)
  );
}

function sample(background: string, foreground = "--color-text-primary") {
  const element = document.createElement("span");
  element.style.backgroundColor = `var(${background})`;
  element.style.color = `var(${foreground})`;
  document.body.append(element);
  const style = getComputedStyle(element);
  return {
    background: renderedColor(style.backgroundColor),
    foreground: renderedColor(style.color),
  };
}

describe("shared dark theme", () => {
  it("renders the agreed grey-blue canvas in CSS, palette metadata, and Storybook chrome", () => {
    const canvas = sample("--color-surface-canvas").background;
    const colors = [canvas, new Color(colorSystem.canvas)];
    for (const value of [agoraTheme.appBg, agoraTheme.appContentBg, agoraTheme.appPreviewBg]) {
      expect(value).toBeDefined();
      colors.push(new Color(value!));
    }
    for (const color of colors) {
      expect(color.to("srgb").coords.map((channel) => Math.round(channel * 255))).toEqual([6, 11, 14]);
    }
  });

  it.each(["info", "success", "warning", "error"])("keeps %s feedback readable on a subdued surface", (tone) => {
    const { background, foreground } = sample(`--color-feedback-${tone}-surface`, `--color-feedback-${tone}-text`);
    expect(foreground.contrast(background, "WCAG21")).toBeGreaterThanOrEqual(colorSystem.contrast.minimumNormalText);
    expect(background.oklch.l).toBeGreaterThan(sample("--color-surface-canvas").background.oklch.l);
    expect(background.oklch.l).toBeLessThan(sample("--color-surface-island-strong").background.oklch.l);
  });

  it.each(["canvas", "raised", "island-strong"])(
    "keeps field errors readable on %s with contrast headroom",
    (surface) => {
      const { background, foreground } = sample(`--color-surface-${surface}`, "--color-feedback-error-text");
      expect(foreground.contrast(background, "WCAG21")).toBeGreaterThanOrEqual(5);
    }
  );
});
