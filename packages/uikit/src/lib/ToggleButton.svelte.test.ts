import ToggleButton from "./ToggleButton.svelte";
import { createPressedController } from "./controllers.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it, vi } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

describe("ToggleButton", () => {
  it("toggles aria-pressed and reports the next state", async () => {
    const onPressedChange = vi.fn();
    const children = createRawSnippet(() => ({ render: () => "Grid" }));
    const controller = createPressedController({ onPressedChange });
    const { getByRole } = render(ToggleButton, { props: { controller, children } });
    const button = getByRole("button", { name: "Grid" });

    expect(button.getAttribute("aria-pressed")).toBe("false");
    await fireEvent.click(button);

    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("does not change state when a consumer prevents the click", async () => {
    const children = createRawSnippet(() => ({ render: () => "Snap" }));
    const { getByRole } = render(ToggleButton, {
      props: {
        children,
        controller: createPressedController(),
        onclick: (event) => event.preventDefault(),
      },
    });
    const button = getByRole("button", { name: "Snap" });

    await fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });
});
