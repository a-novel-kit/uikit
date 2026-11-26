/// <reference types="vite/client" />
import { contrast, luminance, painted, resolveColor } from "../../test/style";
import ColorField from "./ColorField.svelte";
import { createValueController } from "./controllers.svelte";

import { describe, expect, it, onTestFinished } from "vitest";
import { userEvent } from "vitest/browser";

import { swatches } from "@a-novel-kit/uikit-tokens/palette";
import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

/** A color outside the swatches. */
const steel = "#336699";

/** Renders a color field in a box of a given width. */
function renderIn(inlineSize: string, initialValue?: string) {
  const target = document.body.appendChild(document.createElement("div"));
  onTestFinished(() => target.remove());
  target.style.inlineSize = inlineSize;

  const controller = createValueController<string | undefined>({ initialValue });
  return { controller, ...render(ColorField, { target, props: { legend: "Color", name: "color", controller } }) };
}

/** Reads where each choice's target sits. */
const targets = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".choice input"), (input) => input.getBoundingClientRect());

describe("ColorField", () => {
  it("moves through no color and the swatches with the arrow keys, and reaches the color input with Tab", async () => {
    const { controller, getByRole } = renderIn("40rem");

    await userEvent.tab();
    expect(document.activeElement).toBe(getByRole("radio", { name: "No color" }));

    await userEvent.keyboard("{ArrowRight}");
    expect(controller.state.value).toBe(swatches[0].hex);

    await userEvent.keyboard("{ArrowLeft}");
    expect(controller.state.value).toBeUndefined();

    await userEvent.tab();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Another color");
  });

  it("packs its choices as a grid two rows deep, no color first and the color input last", () => {
    const { container } = renderIn("40rem");
    const rows = Map.groupBy(targets(container), (target) => Math.round(target.top));

    expect([...rows.values()].map((row) => row.length)).toEqual([swatches.length / 2 + 1, swatches.length / 2 + 1]);
    expect(container.querySelector(".choice input")!.getAttribute("aria-label")).toBe("No color");
    expect([...container.querySelectorAll(".choice input")].at(-1)!.getAttribute("type")).toBe("color");
  });

  it("keeps its rows together when what holds it stretches it", () => {
    const { container } = renderIn("40rem");
    const field = container.querySelector("fieldset")!;
    const packed = field.querySelector(".choices")!.getBoundingClientRect().height;

    field.style.blockSize = "20rem";

    expect(field.querySelector(".choices")!.getBoundingClientRect().height).toBe(packed);
  });

  it("fits a narrow field without overflowing it", () => {
    const { container } = renderIn("12rem");
    const field = container.querySelector("fieldset")!;

    expect(field.scrollWidth).toBeLessThanOrEqual(field.clientWidth);
  });

  it("gives every choice a target of 24px or more that overlaps no other", () => {
    const { container } = renderIn("40rem");
    const all = targets(container);

    expect(all).toHaveLength(swatches.length + 2);
    for (const [index, target] of all.entries()) {
      expect(target.width).toBeGreaterThanOrEqual(24);
      expect(target.height).toBeGreaterThanOrEqual(24);

      for (const other of all.slice(index + 1)) {
        const apart = target.right <= other.left || other.right <= target.left || target.bottom <= other.top;
        expect(apart).toBe(true);
      }
    }
  });

  it("shows the chosen swatch at full strength, brighter than any swatch at rest", () => {
    const square = (queries: ReturnType<typeof renderIn>, name: string) =>
      getComputedStyle(queries.getByRole("radio", { name }).parentElement!).backgroundColor;

    expect(square(renderIn("40rem", swatches[0].hex), "Sky blue")).toBe(resolveColor(swatches[0].hex));

    // Each swatch at rest, with no color chosen, against its own color.
    const resting = renderIn("40rem");
    for (const [index, input] of resting.getAllByRole("radio").slice(1).entries()) {
      const rest = painted(getComputedStyle(input.parentElement!).backgroundColor);
      const chosen = painted(swatches[index].hex);

      expect(luminance(chosen), swatches[index].name).toBeGreaterThan(luminance(rest));
      expect(contrast(chosen, rest), swatches[index].name).toBeGreaterThanOrEqual(1.5);
    }
  });

  it("fills the square of no color as a neutral action, lit once chosen", () => {
    const blank = (initialValue?: string) =>
      getComputedStyle(renderIn("40rem", initialValue).getByRole("radio", { name: "No color" }).parentElement!)
        .backgroundColor;

    expect(blank(steel)).toBe(resolveColor("var(--color-action-neutral)"));
    expect(blank()).toBe(resolveColor("var(--color-action-neutral-selected)"));
  });

  it("draws a chosen outline button's line around the chosen square, and none around the others", () => {
    const { getByRole } = renderIn("40rem", swatches[0].hex);
    const line = (name: string) => getComputedStyle(getByRole("radio", { name }).parentElement!).borderTopColor;

    expect(line("Sky blue")).toBe(resolveColor("var(--color-border-strong)"));
    expect(line("Blue")).toBe(resolveColor("transparent"));
    expect(line("No color")).toBe(resolveColor("transparent"));
  });

  it("draws that line around the last square once it holds the chosen color", () => {
    const line = (initialValue?: string) =>
      getComputedStyle(renderIn("40rem", initialValue).getByLabelText("Another color").parentElement!).borderTopColor;

    expect(line(steel)).toBe(resolveColor("var(--color-border-strong)"));
    expect(line()).toBe(resolveColor("transparent"));
  });

  it("shows a color outside the swatches as it was picked, in the last square", () => {
    const { getByLabelText } = renderIn("40rem", steel);
    const mark = getByLabelText("Another color").parentElement!.querySelector(".mark")!;

    expect(getComputedStyle(mark).backgroundColor).toBe(resolveColor(steel));
  });
});
