import { createTypeahead, findTypeaheadMatch } from "./typeahead";

import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.useRealTimers());

describe("createTypeahead", () => {
  it("accumulates characters until half a second passes without typing", () => {
    vi.useFakeTimers();
    const typeahead = createTypeahead();

    expect(typeahead.type("D")).toBe("d");
    vi.advanceTimersByTime(499);
    expect(typeahead.type("u")).toBe("du");
    vi.advanceTimersByTime(500);
    expect(typeahead.type("r")).toBe("r");
  });
});

describe("findTypeaheadMatch", () => {
  const labels = ["Rename", undefined, "Delete", "Duplicate"];

  it("searches after the start and wraps around once", () => {
    expect(findTypeaheadMatch(labels, 2, "d")).toBe(3);
    expect(findTypeaheadMatch(labels, 3, "d")).toBe(2);
    expect(findTypeaheadMatch(labels, -1, "re")).toBe(0);
  });

  it("skips undefined labels and reports no match", () => {
    expect(findTypeaheadMatch(labels, 0, "a")).toBe(-1);
    expect(findTypeaheadMatch([], -1, "a")).toBe(-1);
  });
});
