import AccordionItem from "./AccordionItem.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

describe("AccordionItem", () => {
  it("uses native details and summary elements", () => {
    const children = createRawSnippet(() => ({ render: () => "Panel content" }));
    const { container, getByText } = render(AccordionItem, {
      props: { summary: "Keyboard behavior", open: true, children },
    });

    expect(container.querySelector("details")?.hasAttribute("open")).toBe(true);
    expect(getByText("Keyboard behavior").closest("summary")).toBeTruthy();
    expect(getByText("Panel content")).toBeTruthy();
  });

  it("keeps a disabled summary closed", async () => {
    const { container, getByText } = render(AccordionItem, {
      props: { summary: "Unavailable", disabled: true },
    });
    const summary = getByText("Unavailable").closest("summary");

    expect(summary?.getAttribute("aria-disabled")).toBe("true");
    expect(summary?.getAttribute("tabindex")).toBe("-1");
    await fireEvent.click(summary!);
    expect(container.querySelector("details")?.hasAttribute("open")).toBe(false);
  });
});
