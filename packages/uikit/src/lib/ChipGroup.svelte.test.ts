import ChipGroup from "./ChipGroup.svelte";
import { createValueController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

const options = [
  { value: "fantasy", label: "Fantasy" },
  { value: "mystery", label: "Mystery" },
  { value: "western", label: "Western", disabled: true },
];

describe("ChipGroup", () => {
  it("names its checkboxes as a group, with its hint and error", () => {
    const { getByRole } = render(ChipGroup, {
      props: { legend: "Genres", hint: "Up to 10.", error: "Too many.", name: "genres", options },
    });

    const group = getByRole("group", { name: "Genres" });
    expect(group.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
    expect(getByRole("checkbox", { name: "Western" })).toHaveProperty("disabled", true);
  });

  it("marks every choice invalid while the group shows an error", () => {
    const { getAllByRole } = render(ChipGroup, {
      props: { legend: "Genres", error: "Too many.", name: "genres", options },
    });

    expect(getAllByRole("checkbox").map((box) => box.getAttribute("aria-invalid"))).toEqual(["true", "true", "true"]);
  });

  it("adds a value once even when its checkbox fell out of step", async () => {
    const controller = createValueController<readonly string[]>({ initialValue: ["fantasy"] });
    const { getByRole } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller } });
    const fantasy = getByRole("checkbox", { name: "Fantasy" }) as HTMLInputElement;

    fantasy.checked = false;
    await fireEvent.click(fantasy);

    expect(controller.state.value).toEqual(["fantasy"]);
  });

  it("sends its choices to the form it names", () => {
    const other = document.body.appendChild(document.createElement("form"));
    other.id = "other";
    const controller = createValueController<readonly string[]>({ initialValue: ["fantasy"] });
    render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller, form: "other" } });

    expect(new FormData(other).getAll("genres")).toEqual(["fantasy"]);
    other.remove();
  });

  it("names an option in the language it gives", () => {
    const languages = [{ value: "fr", label: "Français", lang: "fr" }];
    const { getByText } = render(ChipGroup, { props: { legend: "Languages", name: "languages", options: languages } });

    expect(getByText("Français").closest("label")?.getAttribute("lang")).toBe("fr");
  });

  it("keeps its controller's choice through a form reset", async () => {
    const form = document.body.appendChild(document.createElement("form"));
    const controller = createValueController<readonly string[]>({ initialValue: ["fantasy"] });
    const { getByRole } = render(ChipGroup, {
      target: form,
      props: { legend: "Genres", name: "genres", options, controller },
    });

    await fireEvent.click(getByRole("checkbox", { name: "Mystery" }));
    form.reset();

    expect(new FormData(form).getAll("genres")).toEqual(["fantasy", "mystery"]);
    form.remove();
  });

  it("joins a caller's description to its hint and error", () => {
    const { getByRole } = render(ChipGroup, {
      props: {
        legend: "Genres",
        hint: "Up to 10.",
        error: "Too many.",
        name: "genres",
        options,
        "aria-describedby": "extra",
      },
    });

    expect(getByRole("group", { name: "Genres" }).getAttribute("aria-describedby")?.split(" ")).toHaveLength(3);
  });

  it("takes back a choice its controller refuses", async () => {
    const controller = { state: { value: [] }, setValue: () => {} };
    const { getByRole } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller } });

    await fireEvent.click(getByRole("checkbox", { name: "Fantasy" }));

    expect(getByRole("checkbox", { name: "Fantasy" })).toHaveProperty("checked", false);
  });

  it("adds a chosen value after the others, and drops an unchosen one", async () => {
    const controller = createValueController<readonly string[]>({ initialValue: ["mystery"] });
    const { getByRole } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller } });

    await fireEvent.click(getByRole("checkbox", { name: "Fantasy" }));
    expect(controller.state.value).toEqual(["mystery", "fantasy"]);

    await fireEvent.click(getByRole("checkbox", { name: "Mystery" }));
    expect(controller.state.value).toEqual(["fantasy"]);
  });
});
