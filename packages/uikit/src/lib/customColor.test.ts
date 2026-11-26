import { customColorStyle } from "./customColor";

import { describe, expect, it } from "vitest";

import { palette, swatches } from "@a-novel-kit/uikit-tokens/palette";

const neutral =
  "--color-ink-custom:var(--color-text-secondary);--color-tint-custom:var(--color-action-neutral);" +
  "--color-ink-custom-lit:var(--color-text-primary);--color-tint-custom-lit:var(--color-action-neutral-hover)";

/** Reads one declaration out of a custom color's style. */
function declared(style: string, token: string) {
  const declaration = style.split(";").find((entry) => entry.startsWith(`${token}:`))!;
  return declaration.slice(token.length + 1);
}

/** Reads the lightness, chroma and hue of an `oklch()` color. */
const coordinates = (color: string) => color.match(/[\d.]+/g)!.map(Number);

describe("customColorStyle", () => {
  it.each([undefined, null, "", "red", "#fff", "#12345", "#1234567", "#12345g", "#123456;color:red"])(
    "draws %j as no color: no mark, and the neutral pair",
    (color) => {
      expect(customColorStyle(color)).toBe(`--color-mark-custom:transparent;${neutral}`);
    }
  );

  // The last one is a gray the eye reads as such, though its channels differ.
  it.each(["#000000", "#ffffff", "#808080", "#FFFFFF", "#808488"])(
    "draws %s, which has no hue, as its mark on the neutral pair",
    (color) => {
      expect(customColorStyle(color)).toBe(`--color-mark-custom:${color};${neutral}`);
    }
  );

  it("keeps the exact color for the mark, whatever its case", () => {
    expect(declared(customColorStyle("#3366CC"), "--color-mark-custom")).toBe("#3366CC");
  });

  // A swatch of one of the three hues draws as that hue's pair does: its tint is the third step of the hue's ramp.
  it.each([
    ["sky", palette.brand],
    ["red", palette.pressure],
    ["amber", palette.signal],
  ] as const)("draws the %s swatch on its hue's own tints", (name, ramp) => {
    const style = customColorStyle(swatches.find((swatch) => swatch.name === name)!.hex);

    for (const [token, step] of [
      ["--color-tint-custom", ramp[2]],
      ["--color-tint-custom-lit", ramp[3]],
    ] as const) {
      const [lightness, chroma, hue] = coordinates(declared(style, token));
      const [stepLightness, stepChroma, stepHue] = coordinates(step);

      expect(lightness).toBeCloseTo(stepLightness, 3);
      expect(chroma).toBeCloseTo(stepChroma, 3);
      expect(Math.abs(hue - stepHue)).toBeLessThan(0.5);
    }
  });

  // Scaling a color's linear channels keeps its hue, so these reds share one hue at three lightnesses and chromas.
  it("draws the colors of one hue alike, whatever their lightness and saturation", () => {
    const pair = (color: string) => customColorStyle(color).replace(`--color-mark-custom:${color};`, "");

    expect(pair("#800000")).toBe(pair("#ff0000"));
    expect(pair("#400000")).toBe(pair("#ff0000"));
  });

  it("draws a grayish color that still shows a hue at that hue's full strength", () => {
    const [, chroma] = coordinates(declared(customColorStyle("#75808c"), "--color-ink-custom"));

    expect(chroma).toBeGreaterThan(0.1);
  });
});
