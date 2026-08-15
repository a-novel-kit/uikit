import { getEnabledCompositeItems, moveCompositeFocus } from "./focus";

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
});
