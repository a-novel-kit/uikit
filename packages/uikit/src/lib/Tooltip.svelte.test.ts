import Tooltip from "./Tooltip.svelte";
import type { TooltipTriggerAttributes } from "./Tooltip.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { fireEvent, render, waitFor } from "@testing-library/svelte";

const trigger = createRawSnippet<[TooltipTriggerAttributes]>((attributes) => ({
  render: () => '<button aria-describedby="' + attributes()["aria-describedby"] + '">Open help</button>',
  setup: (element) => {
    const handlers = attributes();
    const listeners = [
      ["pointerenter", handlers.onpointerenter],
      ["pointerleave", handlers.onpointerleave],
      ["focus", handlers.onfocus],
      ["blur", handlers.onblur],
      ["keydown", handlers.onkeydown],
    ] as const;

    for (const [event, listener] of listeners) {
      element.addEventListener(event, listener as EventListener);
    }

    return () => {
      for (const [event, listener] of listeners) {
        element.removeEventListener(event, listener as EventListener);
      }
    };
  },
}));

describe("Tooltip", () => {
  it("describes its trigger on hover and closes on pointer exit", async () => {
    const { getByRole, queryByRole } = render(Tooltip, {
      props: {
        content: "Open documentation",
        trigger,
        delayDuration: 0,
      },
    });

    const button = getByRole("button", { name: "Open help" });
    expect(queryByRole("tooltip")).toBeNull();

    await fireEvent.pointerEnter(button);
    await waitFor(() => expect(getByRole("tooltip").textContent).toContain("Open documentation"));

    await fireEvent.pointerLeave(button);
    expect(queryByRole("tooltip")).toBeNull();
  });
});
