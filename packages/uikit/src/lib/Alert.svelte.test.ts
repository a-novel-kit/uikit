import Alert from "./Alert.svelte";
import InlineMessage from "./InlineMessage.svelte";
import ToastRegion from "./ToastRegion.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("feedback composition", () => {
  it("supports a named icon-only status without an empty text region", () => {
    const { getByRole } = render(InlineMessage, { tone: "error", "aria-label": "Account unavailable" });
    const status = getByRole("alert", { name: "Account unavailable" });
    expect(status.children).toHaveLength(1);
  });

  it("gives an inline loader one visible, announced message", () => {
    const { getAllByRole } = render(InlineMessage, {
      tone: "loading",
      children: createRawSnippet(() => ({ render: () => "<span>Loading account</span>" })),
    });
    expect(getAllByRole("status")).toHaveLength(1);
    expect(getAllByRole("status")[0].textContent?.trim()).toBe("Loading account");
  });

  it("gives a section loader one announcement and no empty description", () => {
    const { getAllByRole, container } = render(Alert, { tone: "loading", title: "Loading account" });
    expect(getAllByRole("status")).toHaveLength(1);
    expect(getAllByRole("status")[0].textContent?.trim()).toBe("Loading account");
    expect(container.querySelector("strong")?.parentElement?.children).toHaveLength(1);
  });

  it("shows only the message when the title is omitted", () => {
    const { getByRole, container } = render(Alert, {
      tone: "warning",
      children: createRawSnippet(() => ({ render: () => "<span>Account unavailable during maintenance.</span>" })),
    });
    expect(getByRole("status").textContent?.trim()).toBe("Account unavailable during maintenance.");
    expect(container.querySelector("strong")).toBeNull();
  });

  it("preserves custom alert graphics, body, and recovery actions", () => {
    const { getByRole, getByText, container } = render(Alert, {
      tone: "error",
      title: "Upload failed",
      icon: createRawSnippet(() => ({ render: () => "<span data-custom-icon>!</span>" })),
      children: createRawSnippet(() => ({ render: () => "<p>Your file is too large.</p>" })),
      actions: createRawSnippet(() => ({ render: () => '<button type="button">Choose another file</button>' })),
    });
    expect(getByRole("alert")).toBeTruthy();
    expect(getByText("Your file is too large.")).toBeTruthy();
    expect(getByRole("button", { name: "Choose another file" })).toBeTruthy();
    expect(container.querySelector("[data-custom-icon]")?.closest('[aria-hidden="true"]')).toBeTruthy();
  });

  it("keeps toast announcements scoped to each message", () => {
    const { getAllByRole } = render(ToastRegion, {
      toasts: [
        { id: "saved", tone: "success", title: "Saved", message: "Your changes are available." },
        { id: "failed", tone: "error", message: "Upload failed" },
      ],
    });
    expect(getAllByRole("status")).toHaveLength(1);
    expect(getAllByRole("alert")).toHaveLength(1);
  });
});
