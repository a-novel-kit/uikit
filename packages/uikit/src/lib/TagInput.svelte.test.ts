import TagInput from "./TagInput.svelte";
import { createTagInputController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

function renderTags(initialTags: string[] = []) {
  const controller = createTagInputController({ initialTags });
  const view = render(TagInput, { props: { "aria-label": "Tags", name: "tags", controller } });
  const input = view.getByRole("textbox", { name: "Tags" }) as HTMLInputElement;
  const sent = () =>
    Array.from(view.container.querySelectorAll<HTMLInputElement>('input[type="hidden"]'), (tag) => tag.value);
  return { ...view, controller, input, sent };
}

describe("TagInput", () => {
  it("ends a tag at a space or a comma, and keeps what follows as typed", async () => {
    const { input, sent } = renderTags();

    await fireEvent.input(input, { target: { value: "Slow Burn, maps tw" } });

    expect(sent()).toEqual(["slow", "burn", "maps"]);
    expect(input.value).toBe("tw");
  });

  it("ends a tag at Enter, and lets an empty field's Enter through", async () => {
    const { input, sent } = renderTags();

    input.value = "Années 50";
    expect(await fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
    expect(sent()).toEqual(["années-50"]);

    expect(await fireEvent.keyDown(input, { key: "Enter" })).toBe(true);
  });

  it("takes the last tag back as text on Backspace in the empty field", async () => {
    const { input, sent } = renderTags(["maps", "slow-burn"]);

    await fireEvent.keyDown(input, { key: "Backspace" });

    expect(sent()).toEqual(["maps"]);
    expect(input.value).toBe("slow-burn");
  });

  it("keeps the text being typed as a tag when the field loses focus", async () => {
    const { input, sent } = renderTags();

    input.value = "huis clos";
    await fireEvent.blur(input);

    expect(sent()).toEqual(["huis-clos"]);
    expect(input.value).toBe("");
  });

  it("removes a tag with its cross and gives the focus back to the field", async () => {
    const { getByRole, input, sent } = renderTags(["maps", "slow-burn"]);

    await fireEvent.click(getByRole("button", { name: "Remove maps" }));

    expect(sent()).toEqual(["slow-burn"]);
    expect(document.activeElement).toBe(input);
  });

  it("offers no cross while disabled", () => {
    const controller = createTagInputController({ initialTags: ["maps"] });
    const { queryByRole } = render(TagInput, { props: { "aria-label": "Tags", controller, disabled: true } });

    expect(queryByRole("button")).toBeNull();
  });
});
