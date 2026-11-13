/// <reference types="vite/client" />
import RenderedOptionsFixture from "../../test/RenderedOptionsFixture.svelte";
import { offsetFromMiddle } from "../../test/geometry";
import Select from "./Select.svelte";
import { type SelectController, createSelectController } from "./controllers.svelte";

import { tick } from "svelte";

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

it("is there at once when open from its first render, then plays its list out and back in", async () => {
  const controller = createSelectController<string>({ initialOpen: true });
  render(Select, { controller, "aria-label": "Visibility", options });
  const listbox = page.getByRole("listbox").element();
  await tick();
  expect(listbox.getAnimations({ subtree: true })).toHaveLength(0);

  controller.close();
  await tick();

  expect(listbox.isConnected).toBe(true);
  await expect.poll(() => listbox.isConnected).toBe(false);

  controller.open();
  await tick();

  expect(page.getByRole("listbox").element().getAnimations({ subtree: true })).not.toHaveLength(0);
});

it("sets its list against its trigger where the browser leaves it away, and keeps it there on scroll", async () => {
  const unanchored = document.createElement("style");
  unanchored.textContent = ".a-novel-select-content { position-area: none !important; }";
  document.head.append(unanchored);
  document.body.style.paddingBlock = "320px 2000px";

  try {
    render(Select, { controller: createSelectController<string>(), "aria-label": "Visibility", options });
    const trigger = page.getByRole("combobox").element();
    await userEvent.click(trigger);
    const listbox = page.getByRole("listbox").element();
    const gap = () => Math.round(listbox.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom);

    await expect.poll(gap).toBe(2);
    expect(Math.round(listbox.getBoundingClientRect().left)).toBe(Math.round(trigger.getBoundingClientRect().left));

    scrollBy(0, 120);
    await expect.poll(gap).toBe(2);
  } finally {
    unanchored.remove();
    document.body.style.removeProperty("padding-block");
    scrollTo(0, 0);
  }
});

it.each(openPaths)("shows the listbox at its trigger's width when opened by $path", async ({ open }) => {
  const controller = createSelectController<string>();
  render(Select, { controller, "aria-label": "Visibility", options });
  const trigger = page.getByRole("combobox").element() as HTMLElement;
  const shown = anchorWidthOnShow();

  await open(trigger, controller);

  expect(await shown).toBe(trigger.getBoundingClientRect().width + "px");
});

it("closes the listbox when Tab moves focus away", async () => {
  const controller = createSelectController<string>();
  render(Select, { controller, "aria-label": "Visibility", options });
  await userEvent.click(page.getByRole("combobox"));
  await expect.element(page.getByRole("listbox")).toBeVisible();

  await userEvent.keyboard("{Tab}");

  expect(controller.state.open).toBe(false);
});

it("stays closed when a tap on its trigger closes the list before the trigger's click", async () => {
  const controller = createSelectController<string>();
  render(Select, { controller, "aria-label": "Visibility", options });
  const trigger = page.getByRole("combobox").element() as HTMLElement;
  await userEvent.click(trigger);
  const listbox = page.getByRole("listbox").element() as HTMLElement;
  await expect.element(page.getByRole("listbox")).toBeVisible();

  // A touch press outside the list closes it on its own, and the click reaches the trigger only afterwards.
  trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  const closed = new Promise((resolve) => listbox.addEventListener("toggle", resolve, { once: true }));
  listbox.hidePopover();
  await closed;
  trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));

  expect(controller.state.open).toBe(false);
  await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
});

it("centers a rendered option in its trigger and in each row of its list", async () => {
  render(RenderedOptionsFixture, { kind: "select" });
  await expect.poll(() => document.querySelectorAll(".a-novel-select-trigger, [role=option]").length).toBe(3);

  const rows = [...document.querySelectorAll(".a-novel-select-trigger, [role=option]")];
  for (const row of rows)
    expect(Math.abs(offsetFromMiddle(row.querySelector(".language-name")!, row))).toBeLessThan(0.5);
});
