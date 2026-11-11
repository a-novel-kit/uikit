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
    { text: "İstanbul", tag: "i\u0307stanbul" },
    { text: "เรื่อง", tag: "เรื่อง" },
    { text: "हिंदी", tag: "हिंदी" },
    { text: "ラーメン 屋", tag: "ラーメン-屋" },
    { text: "می\u200Cخواهم", tag: "می\u200Cخواهم" },
    { text: "क्\u200Dष", tag: "क्\u200Dष" },
  ])("writes $text as $tag", ({ text, tag }) => {
    expect(kebabTag(text)).toBe(tag);
  });
});
