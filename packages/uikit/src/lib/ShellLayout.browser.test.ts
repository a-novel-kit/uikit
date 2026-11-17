/// <reference types="vite/client" />
import Fixture from "../../test/ShellLayoutFixture.svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

/** Renders the shell at a viewport width, scrolled so the page's bars have left their place in the flow. */
async function renderScrolled(width: number, props: { collapsed?: boolean; banner?: boolean; short?: boolean } = {}) {
  await page.viewport(width, 800);
  const view = render(Fixture, props);
  window.scrollTo({ top: window.innerHeight, behavior: "instant" });
  await Promise.all(document.getAnimations().map((animation) => animation.finished));

  const box = (element: HTMLElement) => element.getBoundingClientRect();
  return {
    ...view,
    rail: box(view.getByRole("complementary", { hidden: true })),
    header: box(view.getByRole("banner", { hidden: true })),
    notice: props.banner ? box(view.getByRole("status")) : undefined,
    main: box(view.getByRole("main")),
    top: box(view.getByText("Top bar")),
    bottom: box(view.getByText("Bottom bar")),
  };
}

describe("ShellLayout", () => {
  it("keeps the rail beside the page and the banner above it on a wide screen", async () => {
    const { rail, header, notice, main, top, bottom } = await renderScrolled(1280, { banner: true });

    expect(rail.right).toBeLessThanOrEqual(main.left);
    expect(rail.height).toBeGreaterThan(0);
    expect(header.height).toBe(0);
    expect(notice!.top).toBe(0);
    expect(top.top).toBeCloseTo(notice!.bottom);
    expect(bottom.bottom).toBeCloseTo(window.innerHeight);
  });

  it("narrows the rail when collapsed, and the page takes the room", async () => {
    const expanded = await renderScrolled(1280);
    expanded.unmount();
    const collapsed = await renderScrolled(1280, { collapsed: true });

    expect(collapsed.rail.width).toBeLessThan(expanded.rail.width / 2);
    expect(collapsed.main.left).toBeLessThan(expanded.main.left);
  });

  it("trades the rail for a fixed header, and drops the banner to the bottom, on a narrow screen", async () => {
    const { rail, header, notice, main, top, bottom } = await renderScrolled(390, { banner: true });

    expect(rail.width).toBe(0);
    expect(header.top).toBe(0);
    expect(main.left).toBe(0);
    expect(top.top).toBeCloseTo(header.bottom);
    expect(notice!.bottom).toBeCloseTo(window.innerHeight);
    expect(bottom.bottom).toBeCloseTo(notice!.top);
  });

  it("keeps the banner at the screen's foot under a short page on a narrow screen", async () => {
    const { notice, main } = await renderScrolled(390, { banner: true, short: true });

    expect(notice!.bottom).toBeCloseTo(window.innerHeight);
    expect(main.bottom).toBeCloseTo(notice!.top);
  });
});
