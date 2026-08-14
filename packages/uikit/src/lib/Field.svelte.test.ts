import Field from "./Field.svelte";
import type { FieldControlProps } from "./Field.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("Field", () => {
  it("omits optional regions while preserving the control contract", () => {
    const children = createRawSnippet<[FieldControlProps]>((control) => ({
      render: () => `<input aria-label="Quick search" id="${control().id}" />`,
    }));

    const { container, getByRole } = render(Field, { props: { controlId: "search", children } });

    expect(container.querySelector("label")).toBeNull();
    expect(container.querySelector(".hint")).toBeNull();
    expect(container.querySelector(".error")).toBeNull();
    expect(getByRole("textbox", { name: "Quick search" }).id).toBe("search");
  });

  it("renders composed label and error content with accessible wiring", () => {
    const label = createRawSnippet(() => ({
      render: () => '<span><svg aria-hidden="true"></svg>Project name</span>',
    }));
    const error = createRawSnippet(() => ({
      render: () => "<span><strong>Unavailable.</strong> Pick another name.</span>",
    }));
    const children = createRawSnippet<[FieldControlProps]>((control) => ({
      render: () =>
        `<input id="${control().id}" aria-describedby="${control()["aria-describedby"]}" aria-invalid="${control()["aria-invalid"]}" />`,
    }));

    const { getByRole, getByText } = render(Field, {
      props: { controlId: "project-name", label, error, children },
    });

    const input = getByRole("textbox", { name: "Project name" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("project-name-error");
    expect(getByText("Unavailable.").closest(".error")?.id).toBe("project-name-error");
  });
});
