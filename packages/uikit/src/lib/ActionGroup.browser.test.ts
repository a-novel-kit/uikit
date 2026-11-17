/// <reference types="vite/client" />
import Fixture from "../../test/ActionGroupFixture.svelte";

import { expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

/** Whether the element's text runs on a single line. */
function oneLine(element: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(element);
  return new Set([...range.getClientRects()].map((rect) => rect.top)).size === 1;
}

// A measuring box has no width of its own, so it would shrink to nothing in a parent that sizes by content.
it.each(["an end-aligned stack", "a row beside a heading"] as const)(
  "keeps its actions side by side in %s",
  async (layout) => {
    await page.viewport(1280, 800);
    const { getByRole, queryByRole } = render(Fixture, { layout });
    const cancel = getByRole("button", { name: "Cancel" }).getBoundingClientRect();
    const save = getByRole("button", { name: "Save" }).getBoundingClientRect();
    const heading = queryByRole("heading");

    expect(save.top).toBe(cancel.top);
    expect(save.left).toBeGreaterThanOrEqual(cancel.right);
    if (heading) expect(oneLine(heading)).toBe(true);
  }
);
