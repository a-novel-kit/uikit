import { normalizeSelectionValue, resolveInvalidState, toSelectionItems } from "./selection";

import { describe, expect, it } from "vitest";

describe("selection helpers", () => {
  it("copies readonly options for composite primitives", () => {
    const options = [{ value: "draft", label: "Draft", disabled: true }] as const;

    const items = toSelectionItems(options);

    expect(items).toEqual(options);
    expect(items).not.toBe(options);
    expect(items[0]).not.toBe(options[0]);
  });

  it("normalizes the empty selection sentinel", () => {
    expect(normalizeSelectionValue("")).toBeUndefined();
    expect(normalizeSelectionValue<"draft">("draft")).toBe("draft");
  });

  it.each([true, "true"] as const)("accepts %s as an ARIA invalid state", (ariaInvalid) => {
    expect(resolveInvalidState(false, ariaInvalid)).toBe(true);
  });

  it("preserves an explicit invalid state", () => {
    expect(resolveInvalidState(true, false)).toBe(true);
  });
});
