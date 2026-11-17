/// <reference types="vite/client" />
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

  it("keeps its feedback and actions at their own height in a taller column", async () => {
    await page.viewport(1280, 800);
    const { getByRole } = render(Fixture, { error: true, blockSize: "600px" });
    const alert = getByRole("alert").getBoundingClientRect();
    const submit = getByRole("button", { name: "Save changes" }).getBoundingClientRect();

    expect(submit.top - alert.bottom).toBe(12);
  });

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
