import PanelHeader from "./PanelHeader.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("PanelHeader", () => {
  it("supports composed content and caller-owned label associations", () => {
    const title = createRawSnippet(() => ({ render: () => "<span>Export <em>a copy</em></span>" }));
    const actions = createRawSnippet(() => ({ render: () => '<button type="button">Close</button>' }));
    const { getByRole, getByText } = render(PanelHeader, {
      title,
      description: "The original stays in your workspace.",
      actions,
      titleId: "export-title",
      descriptionId: "export-description",
    });
    expect(getByRole("heading", { name: "Export a copy" }).id).toBe("export-title");
    expect(getByText("The original stays in your workspace.").id).toBe("export-description");
    expect(getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("leaves no empty regions when only a title is supplied", () => {
    const { getByRole } = render(PanelHeader, { title: "Details" });
    const heading = getByRole("heading", { name: "Details" });
    expect(heading.parentElement?.children.length).toBe(1);
  });
});
