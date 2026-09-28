/// <reference types="vite/client" />
import Fixture from "../../test/DialogFixture.svelte";
import Dialog from "./Dialog.svelte";
import { createOpenController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

describe("Dialog browser lifecycle", () => {
  it.each(["centered", "fullscreen"] as const)(
    "keeps %s content reachable on narrow, short viewports",
    async (presentation) => {
      await page.viewport(320, 480);
      const controller = createOpenController();
      const { getByRole } = render(Fixture, { controller, presentation, long: true });
      await page.getByRole("button", { name: "Open details" }).click();
      const dialog = getByRole("dialog");
      const heading = getByRole("heading");
      const close = getByRole("button", { name: "Close details" });
      const description = dialog.querySelector<HTMLElement>(`#${dialog.getAttribute("aria-describedby")}`)!;
      const rect = dialog.getBoundingClientRect();
      expect(rect.left).toBe(presentation === "fullscreen" ? 0 : 8);
      expect(rect.width).toBe(presentation === "fullscreen" ? 320 : 304);
      expect(rect.height).toBeLessThanOrEqual(480);
      expect(heading.getBoundingClientRect().right).toBeLessThanOrEqual(close.getBoundingClientRect().left - 12);
      expect(description.getBoundingClientRect().left).toBe(heading.getBoundingClientRect().left);
      expect(description.getBoundingClientRect().right).toBe(close.getBoundingClientRect().right);
      expect(description.getBoundingClientRect().top - heading.getBoundingClientRect().bottom).toBe(8);
      expect(parseFloat(getComputedStyle(heading).lineHeight) / parseFloat(getComputedStyle(heading).fontSize)).toBe(
        1.25
      );
      expect(dialog.scrollWidth).toBe(dialog.clientWidth);
      await page.getByRole("button", { name: "Last action" }).click();
      if (presentation === "fullscreen") {
        expect(close.getBoundingClientRect().top).toBe(16);
        const lastAction = getByRole("button", { name: "Last action" });
        let scrollRegion = lastAction.parentElement;
        while (scrollRegion && getComputedStyle(scrollRegion).overflowY !== "auto")
          scrollRegion = scrollRegion.parentElement;
        if (!scrollRegion) throw new Error("Fullscreen body must have a scroll region");
        const scrollBounds = scrollRegion.getBoundingClientRect();
        const actionBounds = lastAction.getBoundingClientRect();
        expect(actionBounds.left - scrollBounds.left).toBeGreaterThanOrEqual(8);
        expect(scrollBounds.right - actionBounds.right).toBeGreaterThanOrEqual(8);
      }
      await page.getByRole("button", { name: "Done" }).click();
      await expect.element(page.getByRole("button", { name: "Open details" })).toHaveFocus();
      await page.getByRole("button", { name: "Open details" }).click();
      await page.getByRole("button", { name: "Close details" }).click();
      expect(controller.state.open).toBe(false);
    }
  );

  it("survives a queued native close after teardown", async () => {
    const view = render(Dialog, {
      props: { controller: createOpenController({ initialOpen: true }), title: "Queued close" },
    });
    const dialog = page.getByRole("dialog").element() as HTMLDialogElement;

    await expect.element(page.getByRole("dialog")).toBeVisible();

    dialog.close("teardown");
    view.unmount();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(dialog.open).toBe(false);
    expect(dialog.returnValue).toBe("teardown");
  });

  it("keeps visibility fixed when its controller rejects a close request", async () => {
    const controller = {
      state: { open: true },
      open() {},
      close() {},
      toggle() {},
    };
    render(Dialog, { props: { controller, title: "Pinned dialog" } });
    const dialog = page.getByRole("dialog").element() as HTMLDialogElement;

    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(controller.state.open).toBe(true);
  });
});
