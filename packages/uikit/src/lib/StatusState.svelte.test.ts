import StatusState from "./StatusState.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("StatusState", () => {
  it.each(["loading", "info", "success", "warning", "error"] as const)(
    "announces %s once with a visible heading",
    (tone) => {
      const { getAllByRole, getByRole, container } = render(StatusState, {
        tone,
        title: "Account feedback",
        headingLevel: 1,
      });
      expect(getAllByRole(tone === "error" ? "alert" : "status")).toHaveLength(1);
      expect(getByRole("heading", { level: 1, name: "Account feedback" })).toBeTruthy();
      expect(container.querySelectorAll("p, button, a")).toHaveLength(0);
    }
  );

  it("composes rich content and recovery actions", () => {
    const { getByRole, getByText } = render(StatusState, {
      title: createRawSnippet(() => ({ render: () => "<span>Check your inbox</span>" })),
      description: createRawSnippet(() => ({ render: () => "<span>Sent to <strong>you@example.test</strong></span>" })),
      actions: createRawSnippet(() => ({ render: () => '<a href="/">Return home</a>' })),
    });
    expect(getByRole("heading", { name: "Check your inbox" })).toBeTruthy();
    expect(getByText("you@example.test").tagName).toBe("STRONG");
    expect(getByRole("link", { name: "Return home" }).getAttribute("href")).toBe("/");
  });

  it("allows static route feedback without a live announcement", () => {
    const { queryByRole, getByRole } = render(StatusState, {
      tone: "error",
      title: "Access denied",
      role: "presentation",
    });
    expect(queryByRole("alert")).toBeNull();
    expect(getByRole("heading", { name: "Access denied" })).toBeTruthy();
  });
});
