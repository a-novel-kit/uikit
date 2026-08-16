import { findEnabledBoundary, findNextEnabledIndex, resolveInvalidState } from "./selection";

import { describe, expect, it } from "vitest";

const options = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review", disabled: true },
  { value: "published", label: "Published" },
] as const;

describe("selection helpers", () => {
  it("finds enabled options from either edge", () => {
    expect(findEnabledBoundary(options, "first")).toBe(0);
    expect(findEnabledBoundary(options, "last")).toBe(2);
    expect(findEnabledBoundary([{ value: "draft", label: "Draft", disabled: true }], "first")).toBe(-1);
  });

  it("skips disabled options and wraps navigation", () => {
    expect(findNextEnabledIndex(options, 0, 1)).toBe(2);
    expect(findNextEnabledIndex(options, 2, 1)).toBe(0);
    expect(findNextEnabledIndex(options, 0, -1)).toBe(2);
  });

  it("keeps the current option when navigation cannot wrap", () => {
    expect(findNextEnabledIndex(options, 2, 1, false)).toBe(2);
  });

  it.each([true, "true"] as const)("accepts %s as an ARIA invalid state", (ariaInvalid) => {
    expect(resolveInvalidState(false, ariaInvalid)).toBe(true);
  });

  it("preserves an explicit invalid state", () => {
    expect(resolveInvalidState(true, false)).toBe(true);
  });
});
