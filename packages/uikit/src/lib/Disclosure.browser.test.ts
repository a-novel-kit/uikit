/// <reference types="vite/client" />
import Fixture from "../../test/DisclosureFixture.svelte";
import Disclosure from "./Disclosure.svelte";
import { createOpenController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

describe("Disclosure", () => {
  it.each([false, true])("preserves a fixed open=%s controller after pointer and keyboard requests", async (open) => {
    const controller = { state: { open }, open() {}, close() {}, toggle() {} };
    const { container } = render(Disclosure, { summary: "Sharing", controller });
    const details = container.querySelector("details")!;
    await page.getByText("Sharing").click();
    await expect.poll(() => details.open).toBe(open);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => details.open).toBe(open);
  });

  it.each([false, true])("preserves native accordion grouping with multiple=%s", async (multiple) => {
    const first = createOpenController({ initialOpen: true });
    const second = createOpenController();
    const { getByText } = render(Fixture, { first, second, multiple });
    expect(getByText("Private").closest("summary")).not.toBeNull();
    await page.getByText("Export preferences").click();
    await expect.poll(() => second.state.open).toBe(true);
    await expect.poll(() => first.state.open).toBe(multiple);
    await expect.element(page.getByText("Export a copy while keeping your original.")).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => second.state.open).toBe(false);
  });
});
