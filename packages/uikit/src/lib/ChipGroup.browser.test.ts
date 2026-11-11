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
  it("dims its well while disabled", () => {
    const options = [{ value: "fantasy", label: "Fantasy" }];
    const { container } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, disabled: true } });

    const well = container.querySelector(".chips")!;
    expect(getComputedStyle(well).backgroundColor).toBe(resolveColor("var(--color-control-surface-disabled)"));
  });
});
