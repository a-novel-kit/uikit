/// <reference types="vite/client" />
import { resolveColor } from "../../test/style";
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

  it("leaves the square of no color blank", () => {
    const { container } = renderIn("40rem", steel);

    expect(getComputedStyle(container.querySelector(".mark")!).backgroundColor).toBe(resolveColor("transparent"));
  });

  it("shows a color outside the swatches as it was picked, on the last choice", () => {
    const { container } = renderIn("40rem", steel);

    const marks = container.querySelectorAll(".mark");
    expect(marks).toHaveLength(swatches.length + 2);
    expect(getComputedStyle(marks[marks.length - 1]).backgroundColor).toBe(resolveColor(steel));
  });
});
