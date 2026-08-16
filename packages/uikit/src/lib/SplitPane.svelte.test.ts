import SplitPane from "./SplitPane.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("SplitPane", () => {
  it.each([
    ["start", ["Secondary", "Primary"]],
    ["end", ["Primary", "Secondary"]],
  ] as const)("places secondary content at the %s of the reading order", (secondaryPosition, expectedOrder) => {
    const children = createRawSnippet(() => ({ render: () => "<span>Primary</span>" }));
    const secondary = createRawSnippet(() => ({ render: () => "<span>Secondary</span>" }));
    const { container } = render(SplitPane, {
      props: { secondaryPosition, secondary, children },
    });
    const split = container.querySelector(".split");

    expect(Array.from(split?.children ?? []).map((child) => child.textContent)).toEqual(expectedOrder);
  });

  it("leaves landmark semantics to composed content", () => {
    const children = createRawSnippet(() => ({ render: () => "<main>Primary</main>" }));
    const secondary = createRawSnippet(() => ({ render: () => "<aside>Secondary</aside>" }));
    const { getByRole } = render(SplitPane, { props: { secondary, children } });

    expect(getByRole("main").textContent).toBe("Primary");
    expect(getByRole("complementary").textContent).toBe("Secondary");
  });
});
