/// <reference types="vite/client" />
import LabelActionsFixture from "../../test/LabelActionsFixture.svelte";

import { describe, expect, it } from "vitest";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

type Action = "none" | "link" | "button";

/** Renders a field with the given action in its label row, and measures the row against the field's box. */
function measure(action: Action) {
  const { container } = render(LabelActionsFixture, { action });
  container.style.inlineSize = "20rem";
  const row = container.querySelector(".label-row")!.getBoundingClientRect();
  const field = container.querySelector(".field")!.getBoundingClientRect();
  const link = container.querySelector("a");

  return { row, field, link };
}

describe("Field label row", () => {
  it("keeps one height with a link, with a small button and with no action", () => {
    const height = measure("none").row.height;

    expect(measure("link").row.height).toBe(height);
    expect(measure("button").row.height).toBe(height);
  });

  // A link is its own text. It once took a text button's overhang and ended 7px past the field.
  it("ends a link where the field does", () => {
    const { link, field } = measure("link");

    expect(link!.getBoundingClientRect().right).toBeCloseTo(field.right);
  });

  // A text button insets its label by a step and its hairline border, so its box ends that far past the field.
  it("ends a text button's label where the field does", () => {
    const { link, field } = measure("button");
    const css = getComputedStyle(link!);
    const inset = parseFloat(css.paddingInlineEnd) + parseFloat(css.borderInlineEndWidth);

    expect(inset).toBeGreaterThan(0);
    expect(link!.getBoundingClientRect().right - inset).toBeCloseTo(field.right);
  });
});
