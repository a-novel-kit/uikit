/// <reference types="vite/client" />
import TagInput from "./TagInput.svelte";
import { createTagInputController } from "./controllers.svelte";

import { describe, expect, it, onTestFinished } from "vitest";

import "@a-novel-kit/uikit-fonts/fonts.css";
import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

function resolveColor(value: string) {
  const sample = document.body.appendChild(document.createElement("span"));
  sample.style.backgroundColor = value;
  const color = getComputedStyle(sample).backgroundColor;
  sample.remove();
  return color;
}

function resolveLength(value: string) {
  const sample = document.body.appendChild(document.createElement("div"));
  sample.style.blockSize = value;
  const length = sample.getBoundingClientRect().height;
  sample.remove();
  return length;
}

/** Waits for the element's transitions, then reads one of its computed styles. */
async function settled(element: Element, property: "backgroundColor" | "borderTopColor") {
  await Promise.all(element.getAnimations().map((animation) => animation.finished));
  return getComputedStyle(element)[property];
}

describe("TagInput", () => {
  it("keeps its error look while focused", async () => {
    const { getByRole, container } = render(TagInput, { props: { "aria-label": "Tags", invalid: true } });

    getByRole("textbox", { name: "Tags" }).focus();

    const well = container.querySelector(".tag-input")!;
    expect(await settled(well, "borderTopColor")).toBe(resolveColor("var(--color-feedback-error-border)"));
  });

  it("shows the error look once its form finds it required and empty", async () => {
    const form = document.body.appendChild(document.createElement("form"));
    onTestFinished(() => form.remove());
    const { container } = render(TagInput, { target: form, props: { "aria-label": "Tags", required: true } });

    form.requestSubmit();

    const well = container.querySelector(".tag-input")!;
    expect(await settled(well, "borderTopColor")).toBe(resolveColor("var(--color-feedback-error-border)"));
  });

  it("keeps a small button's height once a small field holds a tag", () => {
    const controller = createTagInputController({ initialTags: ["maps"] });
    const { container } = render(TagInput, { props: { "aria-label": "Tags", controller, controlSize: "sm" } });

    const height = container.querySelector(".tag-input")!.getBoundingClientRect().height;
    expect(height).toBeCloseTo(resolveLength("var(--control-height-sm)"), 0);
  });
});
