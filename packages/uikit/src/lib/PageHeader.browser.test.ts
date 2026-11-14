/// <reference types="vite/client" />
import PageHeader from "./PageHeader.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it, onTestFinished } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

/** Renders a header on a wide screen with the given actions markup, and returns it with its parts' boxes. */
async function renderHeader(actions: string) {
  await page.viewport(1280, 800);
  onTestFinished(() => page.viewport(414, 896));
  const view = render(PageHeader, {
    props: { title: "Your projects", actions: createRawSnippet(() => ({ render: () => actions })) },
  });
  return {
    view,
    header: view.getByRole("banner").getBoundingClientRect(),
    heading: view.getByRole("heading").getBoundingClientRect(),
    button: view.getByRole("button").getBoundingClientRect(),
    gap: parseFloat(getComputedStyle(view.getByRole("banner")).columnGap),
  };
}

describe("PageHeader", () => {
  it("ends its row with its actions", async () => {
    const { header, heading, button } = await renderHeader("<button>New project</button>");

    expect(button.right).toBe(header.right);
    expect(button.left).toBeGreaterThan(heading.right);
  });

  it("lets an action that grows fill the width the title leaves", async () => {
    const { view, header, heading, button, gap } = await renderHeader(
      '<span style="display: contents"><input aria-label="Search" style="flex: 1"><button>New project</button></span>'
    );
    const search = view.getByRole("textbox", { name: "Search" }).getBoundingClientRect();

    expect(search.left).toBe(heading.right + gap);
    expect(button.left).toBeGreaterThan(search.right);
    expect(button.right).toBe(header.right);
  });
});
