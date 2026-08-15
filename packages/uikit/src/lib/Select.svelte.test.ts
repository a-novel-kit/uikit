import Select from "./Select.svelte";
import type { SelectOption } from "./Select.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it, vi } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

const options = [
  { value: "private", label: "Private" },
  { value: "organization", label: "Organization" },
  { value: "public", label: "Public", disabled: true },
] as const;

describe("Select", () => {
  it("supports an unset value and hidden form input", () => {
    const { container, getByRole } = render(Select, {
      props: {
        id: "visibility",
        name: "visibility",
        options,
        placeholder: "Choose visibility",
      },
    });

    const trigger = getByRole("combobox");
    expect(trigger.getAttribute("id")).toBe("visibility");
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.textContent).toContain("Choose visibility");

    const hiddenInput = container.querySelector<HTMLInputElement>('input[name="visibility"]');
    expect(hiddenInput?.value).toBe("");
  });

  it("opens with the keyboard, skips disabled options, and selects a value", async () => {
    const onValueChange = vi.fn();
    const { getByRole, queryByRole } = render(Select, {
      props: {
        "aria-label": "Visibility",
        value: "private",
        options,
        onValueChange,
      },
    });

    const trigger = getByRole("combobox", { name: "Visibility" });
    await fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(getByRole("listbox")).toBeTruthy();
    expect(getByRole("option", { name: "Public" }).getAttribute("aria-disabled")).toBe("true");

    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await fireEvent.keyDown(trigger, { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledWith("organization");
    expect(queryByRole("listbox")).toBeNull();
    expect(trigger.textContent).toContain("Organization");
  });

  it("uses composed option visuals without replacing accessible labels", async () => {
    const renderOption = createRawSnippet<[SelectOption<string>]>((option) => ({
      render: () => `<span data-testid="option-${option().value}"><svg aria-hidden="true"></svg></span>`,
    }));
    const { getByRole, getByTestId } = render(Select, {
      props: {
        "aria-label": "Visibility",
        value: "private",
        options,
        renderOption,
      },
    });

    expect(getByTestId("option-private")).toBeTruthy();
    await fireEvent.keyDown(getByRole("combobox", { name: "Visibility" }), { key: "ArrowDown" });
    expect(getByRole("option", { name: "Organization" })).toBeTruthy();
    expect(getByTestId("option-organization")).toBeTruthy();
  });

  it("can clear an optional selected value", async () => {
    const onValueChange = vi.fn();
    const { getByRole } = render(Select, {
      props: {
        "aria-label": "Visibility",
        value: "private",
        options,
        allowDeselect: true,
        onValueChange,
      },
    });

    const trigger = getByRole("combobox", { name: "Visibility" });
    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await fireEvent.keyDown(trigger, { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });
});
