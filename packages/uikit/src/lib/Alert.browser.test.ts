/// <reference types="vite/client" />
import Alert from "./Alert.svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

describe("Alert presentation", () => {
  it.each(["loading", "info", "success", "warning", "error"] as const)(
    "keeps %s feedback borderless except for its reading-start accent",
    async (tone) => {
      await page.viewport(320, 800);
      const { getByRole, rerender } = render(Alert, { tone, title: "Account information is temporarily unavailable" });
      const alert = getByRole(tone === "error" ? "alert" : "status");

      for (const dir of ["ltr", "rtl"] as const) {
        await rerender({ dir });
        const style = getComputedStyle(alert);
        expect(parseFloat(style.borderInlineStartWidth)).toBeGreaterThan(1);
        expect(style.borderInlineStartStyle).toBe("solid");
        expect(style.borderInlineEndWidth).toBe("0px");
        expect(style.borderTopWidth).toBe("0px");
        expect(style.borderBottomWidth).toBe("0px");
        expect(alert.scrollWidth).toBeLessThanOrEqual(alert.clientWidth);
      }
    }
  );
});
