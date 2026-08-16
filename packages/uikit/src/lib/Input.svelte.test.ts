import Input from "./Input.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("Input", () => {
  it("forwards native attributes to the input", () => {
    const { getByRole } = render(Input, {
      props: {
        id: "search",
        name: "query",
        placeholder: "Search projects",
        required: true,
      },
    });

    const input = getByRole("textbox");
    expect(input.getAttribute("id")).toBe("search");
    expect(input.getAttribute("name")).toBe("query");
    expect(input.hasAttribute("required")).toBe(true);
  });

  it("renders arbitrary start and end adornments around the input", () => {
    const startAdornment = createRawSnippet(() => ({
      render: () => '<span data-testid="start">@</span>',
    }));
    const endAdornment = createRawSnippet(() => ({
      render: () => '<kbd data-testid="end">⌘ K</kbd>',
    }));

    const { getByRole, getByTestId } = render(Input, {
      props: { startAdornment, endAdornment },
    });

    const input = getByRole("textbox");
    expect(getByTestId("start").compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(input.compareDocumentPosition(getByTestId("end")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
