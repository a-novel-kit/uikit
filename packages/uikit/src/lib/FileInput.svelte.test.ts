import FileInput from "./FileInput.svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("FileInput", () => {
  it("forwards native file constraints and invalid state", () => {
    const { getByLabelText } = render(FileInput, {
      props: {
        "aria-label": "Reference files",
        accept: ".pdf,.txt",
        multiple: true,
        invalid: true,
        controlSize: "lg",
      },
    });
    const input = getByLabelText("Reference files") as HTMLInputElement;

    expect(input.type).toBe("file");
    expect(input.accept).toBe(".pdf,.txt");
    expect(input.multiple).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.className).toContain("lg");
  });
});
