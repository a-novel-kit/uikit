/// <reference types="vite/client" />
import ActionMenu from "./ActionMenu.svelte";
import type { OpenController } from "./controllers.svelte";

import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

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
