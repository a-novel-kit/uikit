import RadioGroup from "./RadioGroup.svelte";
import { createValueController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("RadioGroup", () => {
  it("names an option in the language it gives", () => {
    const options = [
      { value: "en", label: "English", lang: "en" },
      { value: "fr", label: "Français", lang: "fr" },
    ];
    const controller = createValueController<string | undefined>({ initialValue: "en" });
    const { getByRole } = render(RadioGroup, { props: { legend: "Language", options, controller } });

    expect(getByRole("radio", { name: "Français" }).getAttribute("lang")).toBe("fr");
  });
});
