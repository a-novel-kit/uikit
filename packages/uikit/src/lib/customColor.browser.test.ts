/// <reference types="vite/client" />
import { contrast, painted, resolveColor } from "../../test/style";
import { customColorStyle } from "./customColor";

import { describe, expect, it, onTestFinished } from "vitest";

import "@a-novel-kit/uikit-tokens/tokens.css";

/** Reads the hex value the browser paints for a CSS color. */
const hex = (color: string) =>
  "#" +
  painted(color)
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("");

/** Adds an item drawn in a custom color to the page. */
function colored(color: string | undefined) {
  const item = document.body.appendChild(document.createElement("span"));
  onTestFinished(() => item.remove());
  item.style.cssText = customColorStyle(color);
  return item;
}

/** Measures the resting and the lit pair of a custom color as the browser paints them over a backdrop. */
function pairs(color: string | undefined, backdrop: string[]) {
  const item = colored(color);

  return ["", "-lit"].map((form) => {
    const fill = resolveColor(`var(--color-tint-custom${form})`, item);
    const ink = resolveColor(`var(--color-ink-custom${form})`, item);
    return contrast(painted(...backdrop, fill), painted(...backdrop, fill, ink));
  });
}

/** The surfaces an item sits on: the canvas, a card over it, and an opaque island such as a dialog. */
function backdrops() {
  const canvas = resolveColor("var(--color-surface-canvas)");
  return [
    [canvas],
    [canvas, resolveColor("var(--color-surface-island-glass)")],
    [resolveColor("var(--color-surface-island-strong)")],
  ];
}

describe("a custom color", () => {
  // A pair depends on its color's hue alone, so every whole hue of the circle covers every color a person can pick.
  it("keeps each ink at 4.9:1 or more on its tint, for every hue", () => {
    const [canvas] = backdrops();

    for (let hue = 0; hue < 360; hue += 1) {
      for (const ratio of pairs(hex(`oklch(0.7 0.1 ${hue})`), canvas)) {
        expect(ratio, `hue ${hue}`).toBeGreaterThanOrEqual(4.9);
      }
    }
  });

  // What a custom tint fills may also write in primary or secondary text, as an event does under its title.
  it("keeps primary and secondary text at 4.5:1 or more on each tint, for every hue", () => {
    const texts = ["primary", "secondary"].map((role) => resolveColor(`var(--color-text-${role})`));

    for (let hue = 0; hue < 360; hue += 1) {
      const item = colored(hex(`oklch(0.7 0.1 ${hue})`));

      for (const form of ["", "-lit"]) {
        const fill = resolveColor(`var(--color-tint-custom${form})`, item);
        for (const text of texts) {
          expect(contrast(painted(fill), painted(fill, text)), `hue ${hue}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  // Without a hue the pair is neutral, whose fill is a veil over what holds it.
  it.each(["#000000", "#ffffff", "#808080", undefined])("draws %s readable on every surface", (color) => {
    for (const backdrop of backdrops()) {
      for (const ratio of pairs(color, backdrop)) expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });
});
