import { findCompositeTarget, getEnabledCompositeItems, moveCompositeFocus } from "./focus";

import { describe, expect, it } from "vitest";

describe("composite focus helpers", () => {
  it("returns enabled items in document order", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button data-composite-item>First</button>
      <button data-composite-item disabled>Disabled</button>
      <a data-composite-item href="#next">Last</a>
    `;

    expect(getEnabledCompositeItems(container).map((item) => item.textContent?.trim())).toEqual(["First", "Last"]);
  });

  it("moves by one item and wraps when requested", () => {
    const first = document.createElement("button");
    const last = document.createElement("button");
    const items = [first, last];

    expect(moveCompositeFocus(items, first, 1, true)).toBe(last);
    expect(moveCompositeFocus(items, last, 1, true)).toBe(first);
    expect(moveCompositeFocus(items, last, 1, false)).toBeUndefined();
  });

  it("maps edge keys and the orientation's arrow keys to an item", () => {
    const items = ["First", "Middle", "Last"].map((label) =>
      Object.assign(document.createElement("button"), { textContent: label })
    );
    const [first, middle, last] = items;

    expect(findCompositeTarget(items, middle, "Home", "horizontal", false)).toBe(first);
    expect(findCompositeTarget(items, middle, "End", "vertical", false)).toBe(last);
    expect(findCompositeTarget(items, middle, "ArrowRight", "horizontal", false)).toBe(last);
    expect(findCompositeTarget(items, middle, "ArrowLeft", "horizontal", false)).toBe(first);
    expect(findCompositeTarget(items, middle, "ArrowDown", "vertical", false)).toBe(last);
    expect(findCompositeTarget(items, first, "ArrowUp", "vertical", true)).toBe(last);
    expect(findCompositeTarget(items, middle, "ArrowDown", "horizontal", true)).toBeUndefined();
    expect(findCompositeTarget(items, middle, "a", "vertical", true)).toBeUndefined();
  });
});
