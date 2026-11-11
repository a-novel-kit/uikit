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
