/// <reference types="vite/client" />
import ConsentOverDialogFixture from "../../test/ConsentOverDialogFixture.svelte";
import ConsentBanner from "./ConsentBanner.svelte";
import { createConsentController, createOpenController } from "./controllers.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render, within } from "@testing-library/svelte";

const children = createRawSnippet(() => ({
  render: () => "<span>Your browser sends us a report when a page fails or loads slowly.</span>",
}));

describe("ConsentBanner layout", () => {
  it.each([320, 390])("keeps equal gutters inside a %ipx viewport", async (width) => {
    await page.viewport(width, 800);
    const controller = createConsentController({ initialOpen: true });
    const { getByRole, rerender } = render(ConsentBanner, { controller, title: "Error reports", children });

    for (const dir of ["ltr", "rtl"] as const) {
      await rerender({ dir });
      const box = getByRole("region").getBoundingClientRect();
      expect(box.left).toBeGreaterThan(0);
      expect(box.left).toBeCloseTo(window.innerWidth - box.right, 0);
    }
  });

  it("stays in the end corner of a wide viewport", async () => {
    await page.viewport(1280, 800);
    const controller = createConsentController({ initialOpen: true });
    const { getByRole } = render(ConsentBanner, { controller, title: "Error reports", children });

    const box = getByRole("region").getBoundingClientRect();
    expect(box.right).toBeLessThan(window.innerWidth);
    expect(box.left).toBeGreaterThan(window.innerWidth / 2);
  });
});

describe("ConsentBanner over a modal dialog", () => {
  /** Opens the dialog over an unanswered request, and returns the request's copies, the page's first. */
  async function openOver(onChoice = () => {}) {
    const dialog = createOpenController();
    render(ConsentOverDialogFixture, { consent: createConsentController({ initialOpen: true, onChoice }), dialog });
    dialog.open();
    await expect.poll(() => document.querySelectorAll("section").length).toBe(2);
    return { dialog, copies: [...document.querySelectorAll("section")] };
  }

  it("stays answerable in the topmost modal dialog, which leaves the page inert", async () => {
    const onChoice = vi.fn();
    const { copies } = await openOver(onChoice);
    const [onPage, overModal] = copies;

    expect(onPage.closest("dialog")).toBeNull();
    expect(overModal.closest("dialog")?.matches(":modal")).toBe(true);
    expect(overModal.getAttribute("aria-labelledby")).not.toBe(onPage.getAttribute("aria-labelledby"));

    await userEvent.click(within(overModal).getByRole("button", { name: "Accept" }));
    expect(onChoice).toHaveBeenCalledWith("accepted");
    await expect.poll(() => document.querySelectorAll("section").length).toBe(0);
  });

  it("goes back to the page alone once the dialog has faded out", async () => {
    const { dialog } = await openOver();

    dialog.close();

    await expect.poll(() => document.querySelectorAll("section").length).toBe(1);
    expect(document.querySelector("section")!.closest("dialog")).toBeNull();
  });
});
