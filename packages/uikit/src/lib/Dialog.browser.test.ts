/// <reference types="vite/client" />
import BlurredPageFixture from "../../test/BlurredPageFixture.svelte";
import ConsentOverDialogFixture from "../../test/ConsentOverDialogFixture.svelte";
import Fixture from "../../test/DialogFixture.svelte";
import Dialog from "./Dialog.svelte";
import PanelHeader from "./PanelHeader.svelte";
import { createConsentController, createOpenController } from "./controllers.svelte";

import { tick } from "svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const layoutCases = [
  { width: 320, actionSize: "sm" },
  { width: 320, actionSize: "md" },
  { width: 1280, actionSize: "sm" },
  { width: 1280, actionSize: "md" },
] as const;

describe("Dialog browser lifecycle", () => {
  it.each([true, false])("enhances initial open state without closing its controller (modal: %s)", async (modal) => {
    const controller = createOpenController({ initialOpen: true });
    const { getByRole } = render(Dialog, { controller, title: "Account", modal });
    const dialog = getByRole("dialog") as HTMLDialogElement;
    if (modal) await new Promise<void>((resolve) => dialog.addEventListener("close", () => resolve(), { once: true }));
    await expect.poll(() => dialog.open).toBe(true);
    expect(dialog.matches(":modal")).toBe(modal);
    expect(controller.state.open).toBe(true);
    controller.close();
    await expect.poll(() => dialog.open).toBe(false);
    expect(dialog.matches(":modal")).toBe(false);
    controller.open();
    await expect.poll(() => dialog.open).toBe(true);
    expect(dialog.matches(":modal")).toBe(modal);
  });

  it.each(layoutCases)(
    "aligns short and wrapped titles with $actionSize controls at $width pixels",
    async ({ width, actionSize }) => {
      await page.viewport(width, 844);
      for (const title of ["Details", "Workspace details and sharing preferences"]) {
        const controller = createOpenController({ initialOpen: true });
        const view = render(Fixture, { controller, title, actionSize });
        await expect.element(page.getByRole("dialog")).toBeVisible();
        const heading = view.getByRole("heading");
        const text = heading.firstElementChild!.getBoundingClientRect();
        const close = view.getByRole("button", { name: "Close details" }).getBoundingClientRect();
        expect(text.top + text.height / 2).toBeCloseTo(close.top + close.height / 2, 1);
        expect(close.left - heading.getBoundingClientRect().right).toBe(12);
        const description = view.getByText("These settings apply to everyone who can access this workspace.");
        expect(
          description.getBoundingClientRect().top - Math.max(heading.getBoundingClientRect().bottom, close.bottom)
        ).toBe(6);
        const body = view.getByText("Workspace details 1").getBoundingClientRect();
        expect(body.top - description.getBoundingClientRect().bottom).toBe(18);
        expect(body.left).toBe(text.left);
        expect(view.getByRole("dialog").scrollWidth).toBe(view.getByRole("dialog").clientWidth);
        view.unmount();
      }
    }
  );

  it("keeps a title-only panel header at its natural line height", () => {
    const view = render(PanelHeader, { title: "Details" });
    const heading = view.getByRole("heading");
    expect(heading.getBoundingClientRect().height).toBeCloseTo(parseFloat(getComputedStyle(heading).lineHeight), 1);
  });

  it.each(["centered", "fullscreen"] as const)(
    "keeps %s content reachable on narrow, short viewports",
    async (presentation) => {
      await page.viewport(320, 480);
      const controller = createOpenController();
      const { getByRole } = render(Fixture, { controller, presentation, long: true });
      await page.getByRole("button", { name: "Open details" }).click();
      const dialog = getByRole("dialog");
      // The dialog rises as it opens, so its geometry is measured where it comes to rest.
      await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
      const heading = getByRole("heading");
      const close = getByRole("button", { name: "Close details" });
      const description = dialog.querySelector<HTMLElement>(`#${dialog.getAttribute("aria-describedby")}`)!;
      const rect = dialog.getBoundingClientRect();
      expect(rect.left).toBe(presentation === "fullscreen" ? 0 : 6);
      expect(rect.width).toBe(presentation === "fullscreen" ? 320 : 308);
      expect(rect.height).toBeLessThanOrEqual(480);
      expect(heading.getBoundingClientRect().right).toBeLessThanOrEqual(close.getBoundingClientRect().left - 12);
      expect(description.getBoundingClientRect().left).toBe(heading.getBoundingClientRect().left);
      expect(description.getBoundingClientRect().right).toBe(close.getBoundingClientRect().right);
      expect(description.getBoundingClientRect().top - heading.getBoundingClientRect().bottom).toBe(6);
      expect(parseFloat(getComputedStyle(heading).lineHeight) / parseFloat(getComputedStyle(heading).fontSize)).toBe(
        1.25
      );
      expect(dialog.scrollWidth).toBe(dialog.clientWidth);
      const closeTop = close.getBoundingClientRect().top;
      const doneTop = getByRole("button", { name: "Done" }).getBoundingClientRect().top;
      await page.getByRole("button", { name: "Last action" }).click();
      expect(close.getBoundingClientRect().top).toBe(closeTop);
      expect(getByRole("button", { name: "Done" }).getBoundingClientRect().top).toBe(doneTop);
      if (presentation === "fullscreen") {
        // A thin edge, as a phone's compact app header has.
        expect(heading.getBoundingClientRect().top).toBe(3);
        const lastAction = getByRole("button", { name: "Last action" });
        let scrollRegion = lastAction.parentElement;
        while (scrollRegion && getComputedStyle(scrollRegion).overflowY !== "auto")
          scrollRegion = scrollRegion.parentElement;
        if (!scrollRegion) throw new Error("Fullscreen body must have a scroll region");
        const scrollBounds = scrollRegion.getBoundingClientRect();
        const actionBounds = lastAction.getBoundingClientRect();
        expect(actionBounds.left - scrollBounds.left).toBeGreaterThanOrEqual(6);
        expect(scrollBounds.right - actionBounds.right).toBeGreaterThanOrEqual(6);
      }
      await page.getByRole("button", { name: "Done" }).click();
      await expect.element(page.getByRole("button", { name: "Open details" })).toHaveFocus();
      await page.getByRole("button", { name: "Open details" }).click();
      await page.getByRole("button", { name: "Close details" }).click();
      expect(controller.state.open).toBe(false);
    }
  );

  it("is there at once when open from its first render, then fades out and in", async () => {
    const controller = createOpenController({ initialOpen: true });
    const { getByRole } = render(Dialog, { controller, title: "Account" });
    const dialog = getByRole("dialog") as HTMLDialogElement;
    await tick();
    expect(getComputedStyle(dialog).opacity).toBe("1");

    controller.close();
    await tick();

    expect(dialog.open).toBe(false);
    expect(getComputedStyle(dialog).display).toBe("block");
    await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
    expect(getComputedStyle(dialog).display).toBe("none");

    controller.open();
    await tick();

    expect(dialog.open).toBe(true);
    expect(Number(getComputedStyle(dialog).opacity)).toBeLessThan(1);
    await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
    expect(getComputedStyle(dialog).opacity).toBe("1");
  });

  it("holds the page behind it still while open", async () => {
    const controller = createOpenController();
    render(Dialog, { controller, title: "Account" });

    controller.open();
    await tick();
    expect(getComputedStyle(document.documentElement).overflow).toBe("hidden");

    controller.close();
    await tick();
    expect(getComputedStyle(document.documentElement).overflow).not.toBe("hidden");
  });

  it("focuses the dialog itself on open, so no control lights a focus ring", async () => {
    const controller = createOpenController();
    render(Fixture, { controller });
    await page.getByRole("button", { name: "Open details" }).click();
    await expect.element(page.getByRole("dialog")).toHaveFocus();
    expect(document.querySelector(":focus-visible")).toBeNull();
  });

  it("keeps content and dismissal reachable on exceptionally short viewports", async () => {
    await page.viewport(320, 200);
    const controller = createOpenController();
    render(Fixture, { controller, long: true });
    await page.getByRole("button", { name: "Open details" }).click();
    await page.getByRole("button", { name: "Last action" }).click();
    await page.getByRole("button", { name: "Done" }).click();
    await expect.element(page.getByRole("button", { name: "Open details" })).toHaveFocus();
  });

  it.each([true, false])("stays reopened when an earlier close event arrives (modal: %s)", async (modal) => {
    const controller = createOpenController({ initialOpen: true });
    render(Dialog, { props: { controller, title: "Reopened dialog", modal } });
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const dialog = page.getByRole("dialog").element() as HTMLDialogElement;
    const closed = new Promise<void>((resolve) => dialog.addEventListener("close", () => resolve(), { once: true }));

    dialog.close();
    if (modal) dialog.showModal();
    else dialog.show();
    await closed;

    expect(controller.state.open).toBe(true);
    await expect.element(page.getByRole("dialog")).toBeVisible();
  });

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

describe("Dialog over a frosted page", () => {
  it("drops the page's blurs only once its backdrop has faded in, and gives them back as it closes", async () => {
    const controller = createOpenController();
    const { getByTestId, container } = render(BlurredPageFixture, { controller });
    const blur = (element: Element) => getComputedStyle(element).backdropFilter;
    const frosted = [getByTestId("page-card"), getByTestId("page-bar")];
    expect(frosted.map(blur)).not.toContain("none");

    const dialog = container.querySelector("dialog")!;
    controller.open();
    await expect.poll(() => dialog.matches(":modal")).toBe(true);
    // While the backdrop fades in, the page keeps its frost, so no card shows unfrosted.
    expect(frosted.map(blur)).not.toContain("none");
    expect(Number(getComputedStyle(dialog, "::backdrop").opacity)).toBeLessThan(1);

    await expect.poll(() => frosted.map(blur)).toEqual(["none", "none"]);
    expect(Number(getComputedStyle(dialog, "::backdrop").opacity)).toBeGreaterThan(0.99);
    expect(blur(getByTestId("dialog-card"))).not.toBe("none");

    controller.close();
    await expect.poll(() => dialog.matches(":modal")).toBe(false);
    expect(frosted.map(blur)).not.toContain("none");
  });

  // A fixed request inside a moving dialog would travel with it.
  it.each([
    ["fades without rising while it shows a page's request", true, "none"],
    ["rises as it fades in otherwise", false, undefined],
  ])("%s", async (_, asking, translate) => {
    const dialog = createOpenController();
    const consent = createConsentController({ initialOpen: asking });
    const { container } = render(ConsentOverDialogFixture, { consent, dialog });
    const element = container.querySelector("dialog")!;

    dialog.open();
    await new Promise(requestAnimationFrame);

    if (translate) expect(getComputedStyle(element).translate).toBe(translate);
    else expect(getComputedStyle(element).translate).not.toBe("none");
  });
});
