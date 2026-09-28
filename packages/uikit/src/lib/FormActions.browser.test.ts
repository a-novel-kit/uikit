/// <reference types="vite/client" />
import Fixture from "../../test/FormActionsFixture.svelte";

import { describe, expect, it, vi } from "vitest";
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

    expect(submit.getBoundingClientRect().top - inputSurface.getBoundingClientRect().bottom).toBe(32);
    if (width < 560) expect(submit.getBoundingClientRect().width).toBe(form.getBoundingClientRect().width);
    else expect(submit.getBoundingClientRect().width).toBeLessThan(form.getBoundingClientRect().width / 2);

    await rerender({ error: true });
    const alert = getByRole("alert");
    expect(alert.getBoundingClientRect().top - inputSurface.getBoundingClientRect().bottom).toBe(32);
    expect(submit.getBoundingClientRect().top - alert.getBoundingClientRect().bottom).toBe(16);
    expect(form.scrollWidth).toBeLessThanOrEqual(form.clientWidth);
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
