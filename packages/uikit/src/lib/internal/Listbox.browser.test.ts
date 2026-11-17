/// <reference types="vite/client" />
import RenderedOptionsFixture from "../../../test/RenderedOptionsFixture.svelte";
import { offsetFromMiddle } from "../../../test/geometry";
import { anchorWidthOnShow } from "../../../test/style";
import Combobox from "../Combobox.svelte";
import Select from "../Select.svelte";
import { createComboboxController, createSelectController } from "../controllers.svelte";

import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const options = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
];

/** Leaves the control focused with its list closed. */
async function focusClosed(control: HTMLElement) {
  await userEvent.click(control);
  await userEvent.keyboard("{Escape}");
}

function pressArrowDown(control: HTMLElement) {
  control.focus();
  return userEvent.keyboard("{ArrowDown}");
}

/** One way to open a field's list, after `prepare`; without `open`, the field's controller opens it. */
interface Opening {
  path: string;
  prepare?: (control: HTMLElement) => Promise<void>;
  open?: (control: HTMLElement) => Promise<void>;
}

/** Each field that opens a list: how it renders closed, the box whose width its list takes, and how it opens. */
const fields = [
  {
    name: "Select",
    renderClosed: () => {
      const controller = createSelectController<string>();
      return { controller, ...render(Select, { controller, "aria-label": "Field", options }) };
    },
    field: (control: HTMLElement) => control,
    openings: [
      { path: "a click", open: (control) => userEvent.click(control) },
      { path: "the keyboard", open: pressArrowDown },
      { path: "its controller" },
    ] satisfies Opening[],
  },
  {
    name: "Combobox",
    renderClosed: () => {
      const controller = createComboboxController<string>();
      return { controller, ...render(Combobox, { controller, "aria-label": "Field", options }) };
    },
    field: (control: HTMLElement) => control.parentElement!,
    openings: [
      { path: "a click on the input", open: (control) => userEvent.click(control) },
      { path: "its dropdown icon", open: () => userEvent.click(page.getByRole("button", { name: "Show options" })) },
      { path: "ArrowDown", prepare: focusClosed, open: () => userEvent.keyboard("{ArrowDown}") },
      { path: "typing", prepare: focusClosed, open: () => userEvent.keyboard("f") },
      { path: "its controller" },
    ] satisfies Opening[],
  },
];

const openings = fields.flatMap(({ openings, ...field }) =>
  openings.map((opening: Opening) => ({ ...field, ...opening }))
);

it.each(openings)("shows a $name list at its field's width when opened by $path", async (opening) => {
  const { controller, container } = opening.renderClosed();
  const control = page.getByRole("combobox", { name: "Field" }).element() as HTMLElement;
  await opening.prepare?.(control);
  // Resizes the field after any earlier opening, so only a fresh measurement passes.
  container.style.inlineSize = "20rem";
  const shown = anchorWidthOnShow();

  await (opening.open ? opening.open(control) : controller.open());

  expect(await shown).toBe(opening.field(control).getBoundingClientRect().width + "px");
});

/** Each open list of the fixture, and the rows that render an option: its options, and a select's trigger. */
const lists = [
  { kind: "select", rows: "[role=combobox], [role=option]", count: 3 },
  { kind: "combobox", rows: "[role=option]", count: 2 },
] as const;

it.each(lists)("names each option of a $kind in the language it gives", async ({ kind }) => {
  render(RenderedOptionsFixture, { kind });

  await expect.element(page.getByRole("option", { name: "Français" })).toHaveAttribute("lang", "fr");
  await expect.element(page.getByRole("option", { name: "English" })).toHaveAttribute("lang", "en");
});

it.each(lists)("centers a rendered option in each row of a $kind", async ({ kind, rows, count }) => {
  render(RenderedOptionsFixture, { kind });
  await expect.poll(() => document.querySelectorAll(rows).length).toBe(count);

  for (const row of document.querySelectorAll(rows))
    expect(Math.abs(offsetFromMiddle(row.querySelector(".language-name")!, row))).toBeLessThan(0.5);
});
