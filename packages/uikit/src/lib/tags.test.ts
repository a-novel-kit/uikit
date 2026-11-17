import { kebabTag, readTags } from "./tags";

import { describe, expect, it } from "vitest";

describe("kebabTag", () => {
  it.each([
    { text: "Slow Burn", tag: "slow-burn" },
    { text: "Années 50", tag: "années-50" },
    { text: "T\u0308", tag: "\u1e97" },
    { text: "  roman_maritime--  ", tag: "roman-maritime" },
    { text: "Huis-Clos!", tag: "huis-clos" },
    { text: "e\u0301te\u0301", tag: "été" },
    { text: "-- !", tag: "" },
    { text: "İstanbul", tag: "i\u0307stanbul" },
    { text: "เรื่อง", tag: "เรื่อง" },
    { text: "हिंदी", tag: "हिंदी" },
    { text: "ラーメン 屋", tag: "ラーメン-屋" },
    { text: "می\u200Cخواهم", tag: "می\u200Cخواهم" },
    { text: "क्\u200Dष", tag: "क्\u200Dष" },
    { text: "❤\uFE0F", tag: "" },
    { text: "👩\u200D💻", tag: "" },
    { text: "rock👩\u200D💻star", tag: "rock-star" },
  ])("writes $text as $tag", ({ text, tag }) => {
    expect(kebabTag(text)).toBe(tag);
  });
});

describe("readTags", () => {
  it("splits where a TagInput ends a tag, so a server reads its entries the same way", () => {
    const entry = ["科幻", "奇幻、noir", "slow burn،maps"].join("，");

    expect(readTags([entry])).toEqual(["科幻", "奇幻", "noir", "slow", "burn", "maps"]);
  });

  it("drops the empty text a scripted field sends, and repeats of a tag the field holds once", () => {
    expect(readTags(["maps", "noir", ""])).toEqual(["maps", "noir"]);
    expect(readTags(["maps", "maps Maps noir"])).toEqual(["maps", "noir"]);
  });

  it("reads no tag from a file entry", () => {
    expect(readTags([new File(["noir"], "noir.txt"), "maps"])).toEqual(["maps"]);
  });
});
