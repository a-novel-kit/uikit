/// <reference types="vite/client" />
import Alert from "./Alert.svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

describe("Alert presentation", () => {
  it.each(["loading", "info", "success", "warning", "error"] as const)(
    "clips a wide, straight %s accent to the rounded surface at the reading start",
    async (tone) => {
      await page.viewport(320, 800);
      const { getByRole, rerender } = render(Alert, { tone, title: "Account information is temporarily unavailable" });
      const alert = getByRole(tone === "error" ? "alert" : "status");

      for (const dir of ["ltr", "rtl"] as const) {
        await rerender({ dir });
        const style = getComputedStyle(alert);
        expect(style.borderInlineStartWidth).toBe("0px");
        expect(style.borderInlineEndWidth).toBe("0px");
        expect(style.borderTopWidth).toBe("0px");
        expect(style.borderBottomWidth).toBe("0px");
        expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(0);
        expect(style.backgroundImage).toMatch(
          new RegExp(`^linear-gradient\\(to ${dir === "ltr" ? "right" : "left"}, .+ 4px, .+ 4px\\)$`)
        );
        expect(style.backgroundClip).toBe("border-box");
        expect(alert.scrollWidth).toBeLessThanOrEqual(alert.clientWidth);
      }
    }
  );
});
