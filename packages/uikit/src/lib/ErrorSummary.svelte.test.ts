import ErrorSummary from "./ErrorSummary.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { render, waitFor } from "@testing-library/svelte";

describe("ErrorSummary", () => {
  it("links validation messages to their controls", () => {
    const title = createRawSnippet(() => ({ render: () => "<span>Check your answers</span>" }));
    const { getByRole } = render(ErrorSummary, {
      props: {
        title,
        errors: [
          { id: "name", href: "#project-name", message: "Enter a project name" },
          { id: "owner", href: "#project-owner", message: "Choose an owner" },
        ],
      },
    });

    expect(getByRole("heading", { name: "Check your answers" })).toBeTruthy();
    expect(getByRole("link", { name: "Enter a project name" }).getAttribute("href")).toBe("#project-name");
    expect(getByRole("link", { name: "Choose an owner" }).getAttribute("href")).toBe("#project-owner");
  });

  it("can receive focus after failed submission", async () => {
    const { getByRole } = render(ErrorSummary, {
      props: { errors: [{ id: "name", href: "#name", message: "Enter a name" }], focusOnMount: true },
    });

    await waitFor(() => expect(document.activeElement).toBe(getByRole("alert")));
  });
});
