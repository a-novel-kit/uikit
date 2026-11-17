/// <reference types="vite/client" />
import ActionGroupFixture from "../../test/ActionGroupFixture.svelte";
import Fixture from "../../test/FormActionsFixture.svelte";

import { describe, expect, it, onTestFinished, vi } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

describe("FormActions", () => {
  it.each([320, 390, 1280])("separates inputs, feedback, and actions at %ipx", async (width) => {
    await page.viewport(width, 800);
    const { getByRole, rerender } = render(Fixture);
    const input = getByRole("textbox");
    const inputSurface = input.parentElement!;
    const submit = getByRole("button", { name: "Save changes" });
    const form = input.closest("form")!;

    expect(submit.getBoundingClientRect().top - inputSurface.getBoundingClientRect().bottom).toBe(24);
    if (width < 560) expect(submit.getBoundingClientRect().width).toBe(form.getBoundingClientRect().width);
    else expect(submit.getBoundingClientRect().width).toBeLessThan(form.getBoundingClientRect().width / 2);

    await rerender({ error: true });
    const alert = getByRole("alert");
    expect(alert.getBoundingClientRect().top - inputSurface.getBoundingClientRect().bottom).toBe(24);
    expect(submit.getBoundingClientRect().top - alert.getBoundingClientRect().bottom).toBe(12);
    expect(form.scrollWidth).toBeLessThanOrEqual(form.clientWidth);
  });

  it("stacks its actions where the form has less than 35rem, even on a wide screen", async () => {
    await page.viewport(1280, 800);
    const target = document.body.appendChild(document.createElement("div"));
    target.style.inlineSize = "26rem";
    onTestFinished(() => target.remove());
    const { getByRole } = render(Fixture, { target });
    const submit = getByRole("button", { name: "Save changes" });

    expect(submit.getBoundingClientRect().width).toBe(submit.closest("form")!.getBoundingClientRect().width);
  });

  // A measuring box has no width of its own, so it would shrink to nothing in a parent that sizes by content.
  it.each(["an end-aligned stack", "a row beside a heading"] as const)(
    "keeps its actions side by side in %s",
    async (layout) => {
      await page.viewport(1280, 800);
      const { getByRole } = render(ActionGroupFixture, { layout });
      const cancel = getByRole("button", { name: "Cancel" }).getBoundingClientRect();
      const save = getByRole("button", { name: "Save" }).getBoundingClientRect();
      const heading = layout === "a row beside a heading" ? getByRole("heading").getBoundingClientRect() : undefined;

      expect(save.top).toBe(cancel.top);
      expect(save.left).toBeGreaterThanOrEqual(cancel.right);
      if (heading) expect(heading.width).toBeGreaterThan(0);
    }
  );

  it("preserves native submission and adds no leading space to an action-only form", async () => {
    const onsubmit = vi.fn();
    const { getByRole } = render(Fixture, { fields: false, onsubmit });
    const submit = getByRole("button", { name: "Save changes" });
    expect(submit.getBoundingClientRect().top).toBe(submit.closest("form")!.getBoundingClientRect().top);
    await page.getByRole("button", { name: "Cancel" }).click();
    expect(onsubmit).not.toHaveBeenCalled();
    await page.getByRole("button", { name: "Save changes" }).click();
    expect(onsubmit).toHaveBeenCalledOnce();
  });
});
