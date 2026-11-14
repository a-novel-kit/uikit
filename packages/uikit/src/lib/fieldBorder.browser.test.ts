/// <reference types="vite/client" />
import Card from "./Card.svelte";
import ChipGroup from "./ChipGroup.svelte";
import Combobox from "./Combobox.svelte";
import Dialog from "./Dialog.svelte";
import Disclosure from "./Disclosure.svelte";
import Fieldset from "./Fieldset.svelte";
import FileInput from "./FileInput.svelte";
import Input from "./Input.svelte";
import PasswordInput from "./PasswordInput.svelte";
import Popover from "./Popover.svelte";
import type { PopoverTriggerAttributes } from "./Popover.svelte";
import Select from "./Select.svelte";
import StickyBar from "./StickyBar.svelte";
import TagInput from "./TagInput.svelte";
import Textarea from "./Textarea.svelte";
import {
  createComboboxController,
  createOpenController,
  createPressedController,
  createSelectController,
} from "./controllers.svelte";

import { createRawSnippet } from "svelte";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

interface FieldState {
  invalid?: boolean;
  disabled?: boolean;
}

/** Renders one field into the target, in the given state, and returns the control that takes the keyboard's focus. */
type RenderField = (target: HTMLElement, state: FieldState) => HTMLElement;

const options = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
];

const fields: [string, RenderField][] = [
  [
    "Input",
    (target, state) => render(Input, { target, props: { "aria-label": "Field", ...state } }).getByLabelText("Field"),
  ],
  [
    "Textarea",
    (target, state) => render(Textarea, { target, props: { "aria-label": "Field", ...state } }).getByLabelText("Field"),
  ],
  [
    "PasswordInput",
    (target, state) =>
      render(PasswordInput, {
        target,
        props: { "aria-label": "Field", controller: createPressedController(), ...state },
      }).getByLabelText("Field"),
  ],
  [
    "TagInput",
    (target, state) => render(TagInput, { target, props: { "aria-label": "Field", ...state } }).getByLabelText("Field"),
  ],
  [
    "FileInput",
    (target, state) =>
      render(FileInput, { target, props: { "aria-label": "Field", ...state } }).getByLabelText("Field"),
  ],
  [
    "Select",
    (target, state) =>
      render(Select, {
        target,
        props: { "aria-label": "Field", options, controller: createSelectController<string>(), ...state },
      }).getByRole("combobox"),
  ],
  [
    "Combobox",
    (target, state) =>
      render(Combobox, {
        target,
        props: { "aria-label": "Field", options, controller: createComboboxController<string>(), ...state },
      }).getByRole("combobox"),
  ],
  [
    "ChipGroup",
    (target, { invalid, disabled }) =>
      render(ChipGroup, {
        target,
        props: {
          legend: "Field",
          name: "field",
          searchLabel: "Search",
          options,
          disabled,
          error: invalid ? "Up to 10." : undefined,
        },
      }).getByRole("searchbox"),
  ],
];

const popoverTrigger = createRawSnippet<[PopoverTriggerAttributes]>((attributes) => ({
  render: () => `<button popovertarget="${attributes().popovertarget}">Open</button>`,
}));

/** A surface, and how to render it and return the element a field goes into. */
interface Surface {
  name: string;
  mount: () => HTMLElement;
}

const outsideIslands: Surface[] = [
  { name: "the canvas", mount: () => document.body },
  {
    name: "a sticky bar",
    mount: () => render(StickyBar, { props: { edge: "start", "data-testid": "surface" } }).getByTestId("surface"),
  },
  {
    name: "a plain card, which has no surface",
    mount: () => render(Card, { props: { surface: "plain", "data-testid": "surface" } }).getByTestId("surface"),
  },
];

const islands: Surface[] = [
  ...(["subtle", "raised", "ghost", "overlay"] as const).map((surface) => ({
    name: `a ${surface} card`,
    mount: () => render(Card, { props: { surface, "data-testid": "surface" } }).getByTestId("surface"),
  })),
  {
    name: "a dialog",
    mount: () =>
      render(Dialog, {
        props: { controller: createOpenController({ initialOpen: true }), title: "Surface", modal: false },
      }).getByRole("dialog"),
  },
  {
    name: "a popover",
    mount: () =>
      render(Popover, {
        props: {
          controller: createOpenController({ initialOpen: true }),
          trigger: popoverTrigger,
          "data-testid": "surface",
        },
      }).getByTestId("surface"),
  },
  { name: "a fieldset", mount: () => render(Fieldset, { props: { legend: "Surface" } }).getByRole("group") },
  {
    name: "an open disclosure",
    mount: () =>
      render(Disclosure, {
        props: {
          controller: createOpenController({ initialOpen: true }),
          summary: "Surface",
          "data-testid": "surface",
        },
      }).getByTestId("surface"),
  },
];

/** Renders an Input on the surface and returns the box that outlines it. */
function inputOn({ mount }: Surface) {
  return outline(render(Input, { target: mount(), props: { "aria-label": "Field" } }).getByLabelText("Field"));
}

function resolveColor(value: string) {
  const sample = document.body.appendChild(document.createElement("span"));
  sample.style.backgroundColor = value;
  const color = getComputedStyle(sample).backgroundColor;
  sample.remove();
  return color;
}

/** Returns the box that outlines a field: its control, or the nearest of the control's ancestors with a border. */
function outline(control: HTMLElement) {
  let box: HTMLElement | null = control;
  while (box && getComputedStyle(box).borderTopStyle === "none") box = box.parentElement;
  return box!;
}

/** Waits for the box's transitions, then reads the color of its top border. */
async function settledBorder(box: HTMLElement) {
  await Promise.all(box.getAnimations().map((animation) => animation.finished));
  return getComputedStyle(box).borderTopColor;
}

// A wide screen keeps a searchable ChipGroup's well in the page.
beforeAll(() => page.viewport(1280, 800));
afterAll(() => page.viewport(414, 896));

describe("a field's border", () => {
  it.each(fields)("rings a %s outside an island as a ghost card", async (_, renderField) => {
    const control = renderField(document.body, {});

    expect(await settledBorder(outline(control))).toBe(resolveColor("var(--color-border-item)"));
  });

  it.each(fields)("drops the ring of a %s in a card", async (_, renderField) => {
    const card = render(Card, { props: { "data-testid": "card" } }).getByTestId("card");
    const control = renderField(card, {});

    expect(await settledBorder(outline(control))).toBe(resolveColor("transparent"));
  });

  it.each(fields)("outlines a %s the keyboard focuses in the focus color", async (_, renderField) => {
    const control = renderField(document.body, {});

    await userEvent.tab();

    expect(document.activeElement).toBe(control);
    expect(await settledBorder(outline(control))).toBe(resolveColor("var(--color-control-border-focus)"));
  });

  it.each(fields)("outlines an invalid %s in the error color", async (_, renderField) => {
    const control = renderField(document.body, { invalid: true });

    expect(await settledBorder(outline(control))).toBe(resolveColor("var(--color-feedback-error-border)"));
  });

  it.each(fields)("keeps the ring of a disabled %s, so it still reads as a field", async (_, renderField) => {
    const control = renderField(document.body, { disabled: true });

    expect(await settledBorder(outline(control))).toBe(resolveColor("var(--color-border-item)"));
  });

  it.each(outsideIslands)("rings a field on $name", async (surface) => {
    expect(await settledBorder(inputOn(surface))).toBe(resolveColor("var(--color-border-item)"));
  });

  it.each(islands)("drops the ring of a field in $name", async (surface) => {
    expect(await settledBorder(inputOn(surface))).toBe(resolveColor("transparent"));
  });
});
