/// <reference types="vite/client" />
import Combobox from "./Combobox.svelte";
import { type ComboboxController, createComboboxController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const options = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
] as const;

/** Leaves the input focused with its options closed. */
async function focusClosed(input: HTMLElement) {
  await userEvent.click(input);
  await userEvent.keyboard("{Escape}");
}

const openPaths = [
  { path: "a click on the input", open: (input: HTMLElement) => userEvent.click(input) },
  { path: "its dropdown icon", open: () => userEvent.click(page.getByRole("button", { name: "Show options" })) },
  { path: "ArrowDown", prepare: focusClosed, open: () => userEvent.keyboard("{ArrowDown}") },
  { path: "typing", prepare: focusClosed, open: () => userEvent.keyboard("f") },
  { path: "its controller", open: (_: HTMLElement, controller: ComboboxController<string>) => controller.open() },
];

/** Resolves with the anchor width the listbox carries as it shows, before its first paint. */
const anchorWidthOnShow = () =>
  new Promise<string>((resolve) => {
    const read = (event: Event) =>
      resolve((event.target as HTMLElement).style.getPropertyValue("--a-novel-combobox-anchor-width"));
    document.addEventListener("beforetoggle", read, { capture: true, once: true });
  });

describe("Combobox browser interactions", () => {
  it.each([false, true])("renders the controller's fixed query and visibility (open: %s)", async (open) => {
    const controller: ComboboxController<string> = {
      state: { open, value: "en", query: "" },
      open() {},
      close() {},
      toggle() {},
      select() {},
      setQuery() {},
    };
    render(Combobox, { props: { "aria-label": "Language", controller, options } });
    const input = page.getByRole("combobox", { name: "Language" });
    await input.fill("fr");
    await expect.element(input).toHaveValue(open ? "" : "English");
    await expect.element(input).toHaveAttribute("aria-expanded", String(open));
    if (open) {
      expect(page.getByRole("listbox").element().getBoundingClientRect().width).toBeCloseTo(
        input.element().getBoundingClientRect().width
      );
      await page.getByRole("option", { name: "French" }).click();
      await expect.element(page.getByRole("option", { name: "English" })).toHaveAttribute("aria-selected", "true");
      await expect.element(page.getByRole("listbox")).toBeVisible();
    } else {
      await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
    }
  });

  it("keeps the listbox open after clicking its dropdown icon", async () => {
    render(Combobox, {
      props: {
        "aria-label": "Language",
        controller: createComboboxController<string>(),
        options,
      },
    });

    const input = page.getByRole("combobox", { name: "Language" });
    await page.getByRole("button", { name: "Show options" }).click();

    await expect.element(input).toHaveFocus();
    await expect.element(input).toHaveAttribute("aria-expanded", "true");
    await expect.element(page.getByRole("listbox")).toBeVisible();
  });

  it.each(openPaths)("shows the listbox at the input's width when opened by $path", async ({ prepare, open }) => {
    const controller = createComboboxController<string>();
    const { container } = render(Combobox, { props: { "aria-label": "Language", controller, options } });
    const input = page.getByRole("combobox", { name: "Language" }).element() as HTMLElement;
    await prepare?.(input);
    // Resizes the input after any earlier opening, so only a fresh measurement passes.
    container.style.inlineSize = "20rem";
    const shown = anchorWidthOnShow();

    await open(input, controller);

    expect(await shown).toBe(input.getBoundingClientRect().width + "px");
  });
});
