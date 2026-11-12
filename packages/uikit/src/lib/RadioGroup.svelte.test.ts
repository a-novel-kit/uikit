import RadioGroup from "./RadioGroup.svelte";
import { createValueController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

describe("RadioGroup", () => {
  it("keeps its controller's choice through a form reset", async () => {
    const form = document.body.appendChild(document.createElement("form"));
    const options = [
      { value: "en", label: "English" },
      { value: "fr", label: "French" },
    ];
    const controller = createValueController<string | undefined>({ initialValue: "en" });
    const { getByRole } = render(RadioGroup, {
      target: form,
      props: { legend: "Language", name: "language", options, controller },
    });

    await fireEvent.click(getByRole("radio", { name: "French" }));
    form.reset();

    expect(new FormData(form).get("language")).toBe("fr");
    form.remove();
  });

  it("sends its choice to the form it names", () => {
    const other = document.body.appendChild(document.createElement("form"));
    other.id = "other-radio";
    const options = [{ value: "fr", label: "French" }];
    const controller = createValueController<string | undefined>({ initialValue: "fr" });
    render(RadioGroup, { props: { legend: "Language", name: "language", options, controller, form: "other-radio" } });

    expect(new FormData(other).get("language")).toBe("fr");
    other.remove();
  });

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
