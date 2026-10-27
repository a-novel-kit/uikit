/// <reference types="vite/client" />
import ConsentBanner from "./ConsentBanner.svelte";
import { createConsentController } from "./controllers.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const children = createRawSnippet(() => ({
  render: () => "<span>Your browser sends us a report when a page fails or loads slowly.</span>",
}));

describe("ConsentBanner layout", () => {
  it.each([320, 390])("keeps equal gutters inside a %ipx viewport", async (width) => {
    await page.viewport(width, 800);
    const controller = createConsentController({ initialOpen: true });
    const { getByRole, rerender } = render(ConsentBanner, { controller, title: "Error reports", children });

    for (const dir of ["ltr", "rtl"] as const) {
      await rerender({ dir });
      const box = getByRole("region").getBoundingClientRect();
      expect(box.left).toBeGreaterThan(0);
      expect(box.left).toBeCloseTo(window.innerWidth - box.right, 0);
    }
  });

  it("stays in the end corner of a wide viewport", async () => {
    await page.viewport(1280, 800);
    const controller = createConsentController({ initialOpen: true });
    const { getByRole } = render(ConsentBanner, { controller, title: "Error reports", children });

    const box = getByRole("region").getBoundingClientRect();
    expect(box.right).toBeLessThan(window.innerWidth);
    expect(box.left).toBeGreaterThan(window.innerWidth / 2);
  });
});
