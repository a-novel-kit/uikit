import LanguageName from "./LanguageName.svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("LanguageName", () => {
  it("sets the name in its own language beside a silent flag", () => {
    const { container, getByText } = render(LanguageName, { props: { locale: "fr", name: "Français" } });

    expect(getByText("Français").getAttribute("lang")).toBe("fr");
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});
