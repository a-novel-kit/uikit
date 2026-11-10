import StickyBar from "./StickyBar.svelte";

import { createRawSnippet } from "svelte";
import { createAttachmentKey } from "svelte/attachments";

import { describe, expect, it, vi } from "vitest";

import { render } from "@testing-library/svelte";

const children = createRawSnippet(() => ({ render: () => "<span>Actions</span>" }));

describe("StickyBar", () => {
  it("renders its content in a div by default", () => {
    const { getByText } = render(StickyBar, { edge: "start", children });

    expect(getByText("Actions").parentElement?.tagName).toBe("DIV");
  });

  it("renders the element asked for, with the native attributes and the attachment it is given", () => {
    const attached = vi.fn();
    const { getByRole } = render(StickyBar, {
      edge: "start",
      as: "nav",
      "aria-label": "Account sections",
      class: "tabs",
      [createAttachmentKey()]: attached,
      children,
    });

    const bar = getByRole("navigation", { name: "Account sections" });
    expect(bar.classList).toContain("tabs");
    expect(attached).toHaveBeenCalledExactlyOnceWith(bar);
  });
});
