import ColorField, { type ColorFieldController } from "./ColorField.svelte";
import { createValueController } from "./controllers.svelte";

import { describe, expect, it, onTestFinished } from "vitest";

import { swatches } from "@a-novel-kit/uikit-tokens/palette";

import { fireEvent, render } from "@testing-library/svelte";

const amber = swatches.find((swatch) => swatch.name === "amber")!.hex;
/** A color outside the swatches. */
const steel = "#336699";

/** Renders a color field in a form of its own, to read what it submits. */
function renderInForm(initialValue?: string, controller?: ColorFieldController) {
  const form = document.body.appendChild(document.createElement("form"));
  onTestFinished(() => form.remove());

  controller ??= createValueController<string | undefined>({ initialValue });
  const queries = render(ColorField, { target: form, props: { legend: "Color", name: "color", controller } });

  return { ...queries, controller, submitted: () => new FormData(form).getAll("color") };
}

describe("ColorField", () => {
  it("names its choices as a group, with its hint and error", () => {
    const { getByRole, getAllByRole, getByLabelText } = render(ColorField, {
      props: { legend: "Color", hint: "Shows beside the name.", error: "Pick a color.", name: "color" },
    });

    expect(getByRole("group", { name: "Color" }).getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
    expect(getAllByRole("radio")).toHaveLength(swatches.length + 1);
    expect(getByRole("radio", { name: "No color" })).toBeTruthy();
    expect(getByRole("radio", { name: "Amber" })).toBeTruthy();
    expect(getByLabelText("Another color").getAttribute("type")).toBe("color");
  });

  it("has no color until one is chosen", () => {
    const { getByRole, submitted } = renderInForm();

    expect(getByRole("radio", { name: "No color" })).toHaveProperty("checked", true);
    expect(submitted()).toEqual([""]);
  });

  it("sends the chosen swatch to its form", async () => {
    const { getByRole, controller, submitted } = renderInForm();

    await fireEvent.click(getByRole("radio", { name: "Amber" }));

    expect(controller.state.value).toBe(amber);
    expect(submitted()).toEqual([amber]);
  });

  it("sends another color through the color input, in place of a swatch", async () => {
    const { getByLabelText, getAllByRole, controller, submitted } = renderInForm(amber);
    const input = getByLabelText("Another color");

    await fireEvent.input(input, { target: { value: steel } });

    expect(controller.state.value).toBe(steel);
    expect(submitted()).toEqual([steel]);
    expect(input.getAttribute("aria-current")).toBe("true");
    expect(getAllByRole("radio").filter((radio) => (radio as HTMLInputElement).checked)).toEqual([]);
  });

  it("returns to no color", async () => {
    const { getByRole, controller, submitted } = renderInForm(steel);

    await fireEvent.click(getByRole("radio", { name: "No color" }));

    expect(controller.state.value).toBeUndefined();
    expect(submitted()).toEqual([""]);
  });

  it("checks the swatch of a color stored in capitals", () => {
    const { getByRole, getByLabelText } = renderInForm(amber.toUpperCase());

    expect(getByRole("radio", { name: "Amber" })).toHaveProperty("checked", true);
    expect(getByLabelText("Another color").getAttribute("aria-current")).toBeNull();
  });

  it("keeps the choice its controller holds when it refuses another", async () => {
    const refusing = { state: { value: amber }, setValue() {} };
    const { getByRole, submitted } = renderInForm(undefined, refusing);

    await fireEvent.click(getByRole("radio", { name: "Blue" }));

    expect(getByRole("radio", { name: "Amber" })).toHaveProperty("checked", true);
    expect(submitted()).toEqual([amber]);
  });

  it.each([amber, steel])("keeps its controller's choice of %s through a form reset", (color) => {
    const { container, submitted } = renderInForm(color);

    container.closest("form")!.reset();

    expect(submitted()).toEqual([color]);
  });

  it.each([amber, steel])("sends its choice of %s to the form it names", (color) => {
    const other = document.body.appendChild(document.createElement("form"));
    onTestFinished(() => other.remove());
    other.id = "other-color";
    const controller = createValueController<string | undefined>({ initialValue: color });

    render(ColorField, { props: { legend: "Color", name: "color", controller, form: "other-color" } });

    expect(new FormData(other).getAll("color")).toEqual([color]);
  });
});
