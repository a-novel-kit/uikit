import { agoraTheme } from "../src/theme";

import { afterEach, describe, expect, it } from "vitest";

import { colorSystem } from "@a-novel-kit/uikit-tokens/palette";
import "@a-novel-kit/uikit-tokens/tokens.css";

import Color from "colorjs.io";

afterEach(() => document.body.replaceChildren());

function sample(background: string, foreground = "--color-text-primary") {
  const element = document.createElement("span");
  element.style.backgroundColor = `var(${background})`;
  element.style.color = `var(${foreground})`;
  document.body.append(element);
  const style = getComputedStyle(element);
  return {
    background: new Color(style.backgroundColor).toGamut({ method: "css", space: "srgb" }),
    foreground: new Color(style.color).toGamut({ method: "css", space: "srgb" }),
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

  it("keeps the shared role and loader tint visible above raised surfaces", () => {
    expect(sample("--color-feedback-info-surface").background.oklch.l).toBeGreaterThan(
      sample("--color-surface-island-strong").background.oklch.l
    );
  });

  it.each(["info", "success", "warning", "error"])("keeps %s feedback readable on its tinted surface", (tone) => {
    const { background, foreground } = sample(`--color-feedback-${tone}-surface`, `--color-feedback-${tone}-text`);
    expect(foreground.contrast(background, "WCAG21")).toBeGreaterThanOrEqual(colorSystem.contrast.minimumNormalText);
    expect(background.oklch.l).toBeGreaterThan(sample("--color-surface-canvas").background.oklch.l);
  });
});
