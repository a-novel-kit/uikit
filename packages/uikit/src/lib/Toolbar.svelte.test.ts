import Toolbar from "./Toolbar.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { fireEvent, render, waitFor } from "@testing-library/svelte";

const children = createRawSnippet(() => ({
  render: () => `
    <div>
      <button data-composite-item>Copy</button>
      <button data-composite-item disabled>Unavailable</button>
      <button data-composite-item>Refresh</button>
    </div>
  `,
}));

describe("Toolbar", () => {
  it("uses one tab stop and skips disabled controls", async () => {
    const { getByRole } = render(Toolbar, {
      props: { label: "Document actions", children },
    });

    const copy = getByRole("button", { name: "Copy" });
    const refresh = getByRole("button", { name: "Refresh" });

    await waitFor(() => expect(copy.tabIndex).toBe(0));
    expect(refresh.tabIndex).toBe(-1);

    copy.focus();
    await fireEvent.keyDown(copy, { key: "ArrowRight" });

    expect(document.activeElement).toBe(refresh);
    expect(refresh.tabIndex).toBe(0);
    expect(copy.tabIndex).toBe(-1);
  });
});
