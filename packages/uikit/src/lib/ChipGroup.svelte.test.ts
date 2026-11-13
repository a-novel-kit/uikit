import ChipGroup from "./ChipGroup.svelte";
import { createChipGroupController } from "./controllers.svelte";

import { describe, expect, it, vi } from "vitest";

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
    const controller = createChipGroupController({ initialValue: ["fantasy"] });
    const { getByRole } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller } });
    const fantasy = getByRole("checkbox", { name: "Fantasy" }) as HTMLInputElement;

    fantasy.checked = false;
    await fireEvent.click(fantasy);

    expect(controller.state.value).toEqual(["fantasy"]);
  });

  it("sends its choices to the form it names", () => {
    const other = document.body.appendChild(document.createElement("form"));
    other.id = "other";
    const controller = createChipGroupController({ initialValue: ["fantasy"] });
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
    const controller = createChipGroupController({ initialValue: ["fantasy"] });
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
    const controller = { state: { value: [], query: "" }, setValue: () => {}, setQuery: () => {} };
    const { getByRole } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller } });

    await fireEvent.click(getByRole("checkbox", { name: "Fantasy" }));

    expect(getByRole("checkbox", { name: "Fantasy" })).toHaveProperty("checked", false);
  });

  it("adds a chosen value after the others, and drops an unchosen one", async () => {
    const controller = createChipGroupController({ initialValue: ["mystery"] });
    const { getByRole } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller } });

    await fireEvent.click(getByRole("checkbox", { name: "Fantasy" }));
    expect(controller.state.value).toEqual(["mystery", "fantasy"]);

    await fireEvent.click(getByRole("checkbox", { name: "Mystery" }));
    expect(controller.state.value).toEqual(["fantasy"]);
  });
});

describe("ChipGroup sections", () => {
  const sectioned = [
    { value: "cyberpunk", label: "Cyberpunk", section: "Science fiction" },
    { value: "farce", label: "Farce", section: "Comedy" },
    { value: "spaceOpera", label: "Space opera", section: "Science fiction" },
  ];

  it("names each section as a group of its chips, in the order the sections first appear", () => {
    const { getByRole } = render(ChipGroup, {
      props: { legend: "Genres", name: "genres", options: sectioned },
    });

    const fiction = getByRole("group", { name: "Science fiction" });
    expect(Array.from(fiction.querySelectorAll("input"), (input) => input.value)).toEqual(["cyberpunk", "spaceOpera"]);
    expect(getByRole("group", { name: "Comedy" }).querySelectorAll("input")).toHaveLength(1);
  });

  it("hides a section its search empties", () => {
    const controller = createChipGroupController({ initialQuery: "space" });
    const { getByText } = render(ChipGroup, {
      props: { legend: "Genres", name: "genres", searchLabel: "Search genres", options: sectioned, controller },
    });

    expect(getByText("Comedy").closest(".section")?.hasAttribute("hidden")).toBe(true);
    expect(getByText("Science fiction").closest(".section")?.hasAttribute("hidden")).toBe(false);
  });
});

describe("ChipGroup search", () => {
  const searchable = { legend: "Genres", name: "genres", searchLabel: "Search genres" };

  it("hides the chips its search misses, whatever the case and accents, and keeps their choice in the form", async () => {
    const form = document.body.appendChild(document.createElement("form"));
    const controller = createChipGroupController({ initialValue: ["fantasy"] });
    const { getByRole, getByText } = render(ChipGroup, {
      target: form,
      props: { ...searchable, options: [...options, { value: "epic", label: "Épopée" }], controller },
    });

    await fireEvent.input(getByRole("searchbox", { name: "Search genres" }), { target: { value: "EPO" } });

    expect(getByText("Fantasy").closest("label")?.hidden).toBe(true);
    expect(getByText("Épopée").closest("label")?.hidden).toBe(false);
    expect(new FormData(form).getAll("genres")).toEqual(["fantasy"]);
    form.remove();
  });

  it("tells when its search matches nothing", () => {
    const controller = createChipGroupController({ initialQuery: "cyberpunk" });
    const { getByRole } = render(ChipGroup, { props: { ...searchable, options, controller } });

    expect(getByRole("status").textContent).toBe("No matching options");
  });

  it("shows only the search its controller keeps", async () => {
    const controller = { state: { value: [], query: "" }, setValue: () => {}, setQuery: () => {} };
    const { getByRole } = render(ChipGroup, { props: { ...searchable, options, controller } });
    const search = getByRole("searchbox", { name: "Search genres" }) as HTMLInputElement;

    await fireEvent.input(search, { target: { value: "fan" } });

    expect(search.value).toBe("");
  });

  it("never submits on Enter, and empties itself on Escape before a dialog closes", async () => {
    const controller = createChipGroupController({ initialQuery: "fan" });
    const { getByRole } = render(ChipGroup, { props: { ...searchable, options, controller } });
    const search = getByRole("searchbox", { name: "Search genres" });
    const outside = vi.fn();
    document.addEventListener("keydown", outside);

    expect(await fireEvent.keyDown(search, { key: "Enter" })).toBe(false);
    expect(await fireEvent.keyDown(search, { key: "Escape" })).toBe(false);
    expect(controller.state.query).toBe("");
    expect(outside).toHaveBeenCalledOnce();

    await fireEvent.keyDown(search, { key: "Escape" });
    expect(outside).toHaveBeenCalledTimes(2);
    document.removeEventListener("keydown", outside);
  });
});
