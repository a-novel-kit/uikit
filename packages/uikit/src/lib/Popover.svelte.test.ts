import Popover from "./Popover.svelte";
import type { PopoverTriggerAttributes } from "./Popover.svelte";
import { createOpenController } from "./controllers.svelte";

import { createRawSnippet } from "svelte";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { render } from "@testing-library/svelte";

const nativeMatches = Element.prototype.matches;

beforeAll(() => {
  vi.spyOn(Element.prototype, "matches").mockImplementation(function (this: Element, selector) {
    if (selector === ":popover-open") return this.hasAttribute("data-test-popover-open");
    return nativeMatches.call(this, selector);
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("Popover", () => {
  it("connects a composed trigger to native popover content", () => {
    const trigger = createRawSnippet<[PopoverTriggerAttributes]>((attributes) => ({
      render: () =>
        `<button popovertarget="${attributes().popovertarget}" popovertargetaction="${attributes().popovertargetaction}">Open details</button>`,
    }));
    const children = createRawSnippet(() => ({ render: () => "Popover content" }));
    const { container, getByRole, getByText } = render(Popover, {
      props: { trigger, controller: createOpenController(), children },
    });
    const button = getByRole("button", { name: "Open details" });
    const content = container.querySelector<HTMLElement>("[popover]");

    expect(button.getAttribute("popovertarget")).toBe(content?.id);
    expect(button.getAttribute("popovertargetaction")).toBe("toggle");
    expect(content?.getAttribute("popover")).toBe("auto");
    expect(getByText("Popover content")).toBeTruthy();
  });
});
