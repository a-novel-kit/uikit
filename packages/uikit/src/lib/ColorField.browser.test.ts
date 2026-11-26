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

/** Measures a probe set to a size token. */
function tokenSize(token: string) {
  const probe = document.body.appendChild(document.createElement("div"));
  probe.style.blockSize = `var(${token})`;
  const { height } = probe.getBoundingClientRect();
  probe.remove();
  return height;
}

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

  it("keeps a medium field's height while its choices fit one row", () => {
    const { container } = renderIn("40rem");

    expect(container.querySelector(".well")!.getBoundingClientRect().height).toBeCloseTo(
      tokenSize("--control-height-md"),
      0
    );
  });

  it("wraps its choices inside a narrow field", () => {
    const { container } = renderIn("10rem");
    const well = container.querySelector(".well")!;

    expect(well.scrollWidth).toBeLessThanOrEqual(well.clientWidth);
    expect(well.getBoundingClientRect().height).toBeGreaterThan(2 * tokenSize("--control-height-nested"));
  });

  it("gives every choice a target of 24px or more, apart from its neighbors", () => {
    const { container } = renderIn("40rem");
    const targets = Array.from(container.querySelectorAll(".choice input"), (input) => input.getBoundingClientRect());

    expect(targets).toHaveLength(swatches.length + 2);
    for (const [index, target] of targets.entries()) {
      expect(target.width).toBeGreaterThanOrEqual(24);
      expect(target.height).toBeGreaterThanOrEqual(24);
      if (index > 0) expect(targets[index - 1].right).toBeLessThanOrEqual(target.left);
    }
  });

  it("shows a color outside the swatches as it was picked, on the last choice", () => {
    const { container } = renderIn("40rem", steel);

    const marks = container.querySelectorAll(".mark");
    expect(marks).toHaveLength(swatches.length + 1);
    expect(getComputedStyle(marks[marks.length - 1]).backgroundColor).toBe(resolveColor(steel));
  });
});
