import Button from "./Button.svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("Button", () => {
  it("renders a native <button> carrying the variant + size classes", () => {
    const { getByRole } = render(Button, { props: { variant: "ghost", size: "lg" } });
    const button = getByRole("button");
    expect(button.tagName).toBe("BUTTON");
    expect(button.className).toContain("ghost");
    expect(button.className).toContain("lg");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("forwards native attributes through rest props", () => {
    const { getByRole } = render(Button, {
      props: { disabled: true, "aria-label": "save", "aria-pressed": true },
    });
    const button = getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("save");
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });
});
