/// <reference types="vite/client" />
import Badge from "./Badge.svelte";
import ChipGroup from "./ChipGroup.svelte";

import { createRawSnippet } from "svelte";

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

    // Layout rounds the chip's fractional height, which leaves the target at 23.98px, so it is read to the whole pixel.
    const target = container.querySelector(".chip input")!.getBoundingClientRect();
    expect(Math.round(target.height)).toBeGreaterThanOrEqual(24);
    expect(Math.round(target.width)).toBeGreaterThanOrEqual(24);
  });

  it("keeps two narrow chips' targets apart", () => {
    const options = [
      { value: "i", label: "I" },
      { value: "l", label: "l" },
    ];
    const { container } = render(ChipGroup, { props: { legend: "Letters", name: "letters", options } });

    const [first, second] = Array.from(container.querySelectorAll(".chip input"), (input) =>
      input.getBoundingClientRect()
    );
    expect(first.right).toBeLessThanOrEqual(second.left);
  });

  it("dims a chosen option that is disabled", () => {
    const options = [{ value: "western", label: "Western", disabled: true }];
    const controller = { state: { value: ["western"] }, setValue: () => {} };
    const { container } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller } });

    const chip = container.querySelector(".chip")!;
    expect(Number(getComputedStyle(chip).opacity)).toBeLessThan(1);
  });

  it.each(["brand", "accent"] as const)("fills a chosen %s chip as the badge of the same tone", (tone) => {
    const options = [{ value: "fantasy", label: "Fantasy" }];
    const controller = { state: { value: ["fantasy"] }, setValue: () => {} };
    const { container } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller, tone } });
    const { getByText } = render(Badge, {
      tone,
      children: createRawSnippet(() => ({ render: () => "<span>Badge</span>" })),
    });

    const chip = getComputedStyle(container.querySelector(".chip")!).backgroundColor;
    expect(chip).toBe(getComputedStyle(getByText("Badge").parentElement!).backgroundColor);
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
