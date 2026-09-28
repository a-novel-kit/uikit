/// <reference types="vite/client" />
import Select from "./Select.svelte";
import type { SelectController } from "./controllers.svelte";

import { expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

it("sizes an initially open selection and respects rejected selection and dismissal", async () => {
  const controller: SelectController<string> = {
    state: { open: true, value: "private" },
    open() {},
    close() {},
    toggle() {},
    select() {},
  };
  render(Select, {
    controller,
    "aria-label": "Visibility",
    options: [
      { value: "private", label: "Private" },
      { value: "public", label: "Public" },
    ],
  });
  const input = page.getByRole("combobox");
  const listbox = page.getByRole("listbox");
  await expect.element(listbox).toBeVisible();
  expect(listbox.element().getBoundingClientRect().width).toBeCloseTo(input.element().getBoundingClientRect().width);
  await page.getByRole("option", { name: "Public" }).click();
  await input.click();
  await expect.element(listbox).toBeVisible();
  await expect.element(page.getByRole("option", { name: "Private" })).toHaveAttribute("aria-selected", "true");
});
