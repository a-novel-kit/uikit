/// <reference types="vite/client" />
import Combobox from "./Combobox.svelte";
import { type ComboboxController, createComboboxController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const options = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
] as const;

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
});
