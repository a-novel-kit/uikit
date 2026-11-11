/// <reference types="vite/client" />
import ChipGroup from "./ChipGroup.svelte";

import { describe, expect, it } from "vitest";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

function resolveColor(value: string) {
  const sample = document.body.appendChild(document.createElement("span"));
  sample.style.backgroundColor = value;
  const color = getComputedStyle(sample).backgroundColor;
  sample.remove();
  return color;
}

describe("ChipGroup", () => {
  it("keeps a medium field's height while its chips fit one row", () => {
    const options = [{ value: "fantasy", label: "Fantasy" }];
    const { container } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options } });
    const probe = document.body.appendChild(document.createElement("div"));
    probe.style.blockSize = "var(--control-height-md)";
    const height = probe.getBoundingClientRect().height;
    probe.remove();

    expect(container.querySelector(".chips")!.getBoundingClientRect().height).toBeCloseTo(height, 0);
  });

  it("reaches past a short chip's edges to the 24px minimum target", () => {
    const options = [{ value: "a", label: "A" }];
    const { container } = render(ChipGroup, { props: { legend: "Letters", name: "letters", options } });

    // The token resolves to 23.98px through its rem arithmetic, so the target is read to the whole pixel.
    const target = container.querySelector(".chip input")!.getBoundingClientRect();
    expect(Math.round(target.height)).toBeGreaterThanOrEqual(24);
    expect(Math.round(target.width)).toBeGreaterThanOrEqual(24);
  });

  it("dims a chosen option that is disabled", () => {
    const options = [{ value: "western", label: "Western", disabled: true }];
    const controller = { state: { value: ["western"] }, setValue: () => {} };
    const { container } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller } });

    const chip = container.querySelector(".chip")!;
    expect(Number(getComputedStyle(chip).opacity)).toBeLessThan(1);
  });

  it("keeps its error surface while disabled", () => {
    const options = [{ value: "fantasy", label: "Fantasy" }];
    const { container } = render(ChipGroup, {
      props: { legend: "Genres", name: "genres", options, disabled: true, error: "Too many." },
    });

    const well = container.querySelector(".chips")!;
    expect(getComputedStyle(well).backgroundColor).toBe(resolveColor("var(--color-control-surface-invalid)"));
  });

  it("dims its well while disabled", () => {
    const options = [{ value: "fantasy", label: "Fantasy" }];
    const { container } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, disabled: true } });

    const well = container.querySelector(".chips")!;
    expect(getComputedStyle(well).backgroundColor).toBe(resolveColor("var(--color-control-surface-disabled)"));
  });
});
