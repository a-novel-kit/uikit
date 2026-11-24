/// <reference types="vite/client" />
import RenderedOptionsFixture from "../../../test/RenderedOptionsFixture.svelte";
import { offsetFromMiddle } from "../../../test/geometry";
import { anchorWidthOnShow, resolveColor, settledStyle } from "../../../test/style";
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

// A list its controller opens starts on the chosen option, as one a click opens does.
it.each(fields)("starts a $name list its controller opens on the chosen option", async ({ renderClosed }) => {
  const { controller } = renderClosed();
  controller.select("fr");
  const control = page.getByRole("combobox", { name: "Field" }).element() as HTMLElement;

  controller.open();

  const french = page.getByRole("option", { name: "French" });
  await expect.element(french).toBeInTheDocument();
  await expect.poll(() => control.getAttribute("aria-activedescendant")).toBe(french.element().id);
});

// The list paints nothing over the page, so its frost blurs what lies under it.
it.each(fields)("frosts the page under a $name list", async ({ renderClosed }) => {
  const { controller } = renderClosed();

  controller.open();

  const list = page.getByRole("listbox");
  await expect.element(list).toBeVisible();
  expect(getComputedStyle(list.element()).backgroundColor).toBe(resolveColor("transparent"));
  expect(getComputedStyle(list.element().querySelector(".frost")!, "::before").backdropFilter).toContain("blur");
});

/** Resolves a shadow, such as a token reference, to its computed value. */
function resolveShadow(value: string) {
  const sample = document.body.appendChild(document.createElement("span"));
  sample.style.boxShadow = value;
  const shadow = getComputedStyle(sample).boxShadow;
  sample.remove();
  return shadow;
}

// The field reads as focused while its list shows, and the list carries the same outline and glow.
it.each(fields)("outlines an open $name list as its focused field", async ({ renderClosed }) => {
  const { controller } = renderClosed();

  controller.open();

  const list = page.getByRole("listbox");
  await expect.element(list).toBeVisible();
  const style = await settledStyle(list.element());
  expect(style.outlineColor).toBe(resolveColor("var(--color-control-border-focus)"));
  expect(style.boxShadow.startsWith(resolveShadow("var(--shadow-focus-ring)"))).toBe(true);
});

// A border sits under the frost, whose clip eats the border's inner edge along each corner. An outline is painted
// last, and the frost fills the list's whole box under it.
it.each(fields)("draws an open $name list's outline above its frost", async ({ renderClosed }) => {
  const { controller } = renderClosed();

  controller.open();

  const list = page.getByRole("listbox");
  await expect.element(list).toBeVisible();
  const style = getComputedStyle(list.element());
  const frost = list.element().querySelector(".frost")!.getBoundingClientRect();
  const box = list.element().getBoundingClientRect();
  expect(style.borderTopColor).toBe(resolveColor("transparent"));
  expect(parseFloat(style.outlineOffset)).toBe(-parseFloat(style.outlineWidth));
  expect([frost.left, frost.top, frost.right, frost.bottom]).toEqual([box.left, box.top, box.right, box.bottom]);
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
