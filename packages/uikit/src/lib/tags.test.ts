import { kebabTag } from "./tags";

import { describe, expect, it } from "vitest";

describe("kebabTag", () => {
  it.each([
    { text: "Slow Burn", tag: "slow-burn" },
    { text: "Années 50", tag: "années-50" },
    { text: "  roman_maritime--  ", tag: "roman-maritime" },
    { text: "Huis-Clos!", tag: "huis-clos" },
    { text: "été", tag: "été" },
    { text: "-- !", tag: "" },
  ])("writes $text as $tag", ({ text, tag }) => {
    expect(kebabTag(text)).toBe(tag);
  });
});
