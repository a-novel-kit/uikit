import Combobox from "./Combobox.svelte";

import { describe, expect, it } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

const options = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
] as const;

describe("Combobox", () => {
  it("opens its options when the searchable input receives focus", async () => {
    const { getByRole, queryByRole } = render(Combobox, {
      props: {
        "aria-label": "Language",
        options,
      },
    });

    const input = getByRole("combobox", { name: "Language" });
    expect(queryByRole("listbox")).toBeNull();

    await fireEvent.focus(input);

    expect(getByRole("listbox")).toBeTruthy();
    expect(getByRole("option", { name: "English" })).toBeTruthy();
    expect(getByRole("button", { name: "Show options" }).getAttribute("data-state")).toBe("open");
  });

  it("opens from the icon without moving focus away from the input", async () => {
    const { getByRole, queryByRole } = render(Combobox, {
      props: {
        "aria-label": "Language",
        options,
      },
    });

    const input = getByRole("combobox", { name: "Language" });
    const trigger = getByRole("button", { name: "Show options" });
    expect(queryByRole("listbox")).toBeNull();

    await fireEvent.pointerDown(trigger, { button: 0 });
    await fireEvent.click(trigger);

    expect(document.activeElement).toBe(input);
    expect(getByRole("listbox")).toBeTruthy();
    expect(trigger.getAttribute("data-state")).toBe("open");

    await fireEvent.pointerDown(trigger, { button: 0 });
    await fireEvent.click(trigger);
    expect(getByRole("listbox")).toBeTruthy();
    expect(document.activeElement).toBe(input);
  });

  it("applies a configurable maximum menu height", async () => {
    const { getByRole } = render(Combobox, {
      props: {
        "aria-label": "Language",
        options,
        maxMenuHeight: "8rem",
      },
    });

    await fireEvent.focus(getByRole("combobox", { name: "Language" }));

    const listbox = getByRole("listbox");
    const content = listbox.closest<HTMLElement>(".agora-combobox-content");
    expect(content?.style.getPropertyValue("--agora-combobox-menu-max-height")).toBe("8rem");
  });
});
