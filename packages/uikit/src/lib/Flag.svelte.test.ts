import Flag from "./Flag.svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("Flag", () => {
  it.each(["en", "fr"] as const)("is an image named by its label, for %s", (locale) => {
    const { getByRole } = render(Flag, { locale, label: "Language" });

    expect(getByRole("img", { name: "Language" }).querySelector("title")?.textContent).toBe("Language");
  });

  it("is decorative without a label", () => {
    const { container, queryByRole } = render(Flag, { locale: "fr" });

    expect(queryByRole("img")).toBeNull();
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("title")).toBeNull();
  });
});
