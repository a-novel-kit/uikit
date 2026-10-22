/// <reference types="vite/client" />
import ActionMenuTriggerFixture from "../../test/ActionMenuTriggerFixture.svelte";
import ActionMenu from "./ActionMenu.svelte";
import { type OpenController, createOpenController } from "./controllers.svelte";

import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const click = (trigger: HTMLElement) => userEvent.click(trigger);

function pressArrowUp(trigger: HTMLElement) {
  trigger.focus();
  return userEvent.keyboard("{ArrowUp}");
}

const openPaths = [
  { path: "a click", open: click },
  { path: "the keyboard", open: pressArrowUp },
  { path: "its controller", open: (_: HTMLElement, controller: OpenController) => controller.open() },
  { path: "a click on a composed trigger", composed: true, open: click },
  { path: "the keyboard on a composed trigger", composed: true, open: pressArrowUp },
];

/** Resolves with the anchor width the menu carries as it shows, before its first paint. */
const anchorWidthOnShow = () =>
  new Promise<string>((resolve) => {
    const read = (event: Event) =>
      resolve((event.target as HTMLElement).style.getPropertyValue("--a-novel-menu-anchor-width"));
    document.addEventListener("beforetoggle", read, { capture: true, once: true });
  });

it("anchors a fixed open menu to its trigger and preserves it after selection or Escape", async () => {
  await page.viewport(1280, 800);
  const controller: OpenController = { state: { open: true }, open() {}, close() {}, toggle() {} };
  render(ActionMenu, {
    controller,
    label: "Workspace item actions",
    triggerText: "Workspace item actions",
    items: [{ id: "rename", label: "Rename" }],
  });
  const menu = page.getByRole("menu");
  await expect.element(menu).toBeVisible();
  expect(menu.element().getBoundingClientRect().right).toBeCloseTo(
    page.getByRole("button", { name: "Workspace item actions" }).element().getBoundingClientRect().right
  );
  await page.getByRole("menuitem", { name: "Rename" }).click();
  await userEvent.keyboard("{Escape}");
  await expect.element(menu).toBeVisible();
});

it.each(openPaths)("shows the menu with its trigger's width when opened by $path", async ({ composed, open }) => {
  const controller = createOpenController();
  if (composed) render(ActionMenuTriggerFixture, { controller });
  else render(ActionMenu, { controller, label: "Item actions", items: [{ id: "rename", label: "Rename" }] });
  const trigger = page.getByRole("button", { name: "Item actions" }).element() as HTMLElement;
  const shown = anchorWidthOnShow();

  await open(trigger, controller);

  expect(await shown).toBe(trigger.getBoundingClientRect().width + "px");
});
