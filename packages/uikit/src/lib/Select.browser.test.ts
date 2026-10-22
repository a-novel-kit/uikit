/// <reference types="vite/client" />
import Select from "./Select.svelte";
import { type SelectController, createSelectController } from "./controllers.svelte";

import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const options = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
];

const openPaths = [
  { path: "a click", open: (trigger: HTMLElement) => userEvent.click(trigger) },
  {
    path: "the keyboard",
    open: (trigger: HTMLElement) => {
      trigger.focus();
      return userEvent.keyboard("{ArrowDown}");
    },
  },
  { path: "its controller", open: (_: HTMLElement, controller: SelectController<string>) => controller.open() },
];

/** Resolves with the anchor width the listbox carries as it shows, before its first paint. */
const anchorWidthOnShow = () =>
  new Promise<string>((resolve) => {
    const read = (event: Event) =>
      resolve((event.target as HTMLElement).style.getPropertyValue("--a-novel-select-anchor-width"));
    document.addEventListener("beforetoggle", read, { capture: true, once: true });
  });

it("sizes an initially open selection and respects rejected selection and dismissal", async () => {
  const controller: SelectController<string> = {
    state: { open: true, value: "private" },
    open() {},
    close() {},
    toggle() {},
    select() {},
  };
  render(Select, { controller, "aria-label": "Visibility", options });
  const input = page.getByRole("combobox");
  const listbox = page.getByRole("listbox");
  await expect.element(listbox).toBeVisible();
  expect(listbox.element().getBoundingClientRect().width).toBeCloseTo(input.element().getBoundingClientRect().width);
  await page.getByRole("option", { name: "Public" }).click();
  await input.click();
  await expect.element(listbox).toBeVisible();
  await expect.element(page.getByRole("option", { name: "Private" })).toHaveAttribute("aria-selected", "true");
});

it.each(openPaths)("shows the listbox at its trigger's width when opened by $path", async ({ open }) => {
  const controller = createSelectController<string>();
  render(Select, { controller, "aria-label": "Visibility", options });
  const trigger = page.getByRole("combobox").element() as HTMLElement;
  const shown = anchorWidthOnShow();

  await open(trigger, controller);

  expect(await shown).toBe(trigger.getBoundingClientRect().width + "px");
});
