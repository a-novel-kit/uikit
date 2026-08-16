import Textarea from "./Textarea.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("Textarea", () => {
  it("stacks adornments after the editable area", () => {
    const startAdornment = createRawSnippet(() => ({
      render: () => '<span data-testid="start">Plain text supported</span>',
    }));
    const endAdornment = createRawSnippet(() => ({
      render: () => '<span data-testid="end">0 / 500</span>',
    }));

    const { container, getByRole, getByTestId } = render(Textarea, {
      props: { startAdornment, endAdornment },
    });

    const textarea = getByRole("textbox");
    const adornments = container.querySelector(".adornments");
    expect(adornments).not.toBeNull();
    expect(textarea.compareDocumentPosition(adornments!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(adornments?.children).toHaveLength(2);
    expect(
      getByTestId("start").compareDocumentPosition(getByTestId("end")) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
