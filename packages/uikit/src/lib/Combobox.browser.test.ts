import Combobox from "./Combobox.svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { render } from "@testing-library/svelte";

const options = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
] as const;

describe("Combobox browser interactions", () => {
  it("keeps the listbox open after clicking its dropdown icon", async () => {
    render(Combobox, {
      props: {
        "aria-label": "Language",
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
