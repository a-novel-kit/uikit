/// <reference types="vite/client" />
import Button from "./Button.svelte";
import Link from "./Link.svelte";

import { createRawSnippet } from "svelte";

import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

function tokenColor(token: string) {
  const sample = document.createElement("span");
  sample.style.backgroundColor = `var(${token})`;
  document.body.append(sample);
  const color = getComputedStyle(sample).backgroundColor;
  sample.remove();
  return color;
}

function appearance(element: HTMLElement) {
  const css = getComputedStyle(element);
  return { background: css.backgroundColor, border: css.borderColor, color: css.color, shadow: css.boxShadow };
}

beforeEach(async () => userEvent.unhover(document.body));

describe("low-emphasis action feedback", () => {
  for (const variant of ["outline", "ghost"] as const) {
    it.each(["brand", "neutral", "danger"] as const)(
      `${variant} %s uses shared hover and active layers`,
      async (tone) => {
        const { getByRole, rerender } = render(Button, { variant, tone, "aria-label": "Save" });
        const button = getByRole("button");
        await userEvent.hover(button);
        await expect
          .poll(() => getComputedStyle(button).backgroundColor)
          .toBe(tokenColor("--color-action-subtle-hover"));
        await Promise.all(button.getAnimations().map((animation) => animation.finished));
        const activeForeground = getComputedStyle(button).color;

        await userEvent.unhover(button);
        button.focus();
        await userEvent.keyboard("[Space>]");
        await expect
          .poll(() => getComputedStyle(button).backgroundColor)
          .toBe(tokenColor("--color-action-subtle-active"));
        await expect.poll(() => getComputedStyle(button).color).toBe(activeForeground);
        await userEvent.keyboard("[/Space]");
        expect(parseFloat(getComputedStyle(button).outlineWidth)).toBeGreaterThan(0);

        await rerender({ disabled: true });
        await expect
          .poll(() => getComputedStyle(button).backgroundColor)
          .toBe(tokenColor("--color-action-disabled-surface"));
        expect(getComputedStyle(button).boxShadow).toBe("none");
      }
    );
  }

  it.each(["brand", "neutral", "danger"] as const)(
    "keeps %s selection identical across variants and pointer states",
    async (tone) => {
      const { getByRole, rerender } = render(Button, {
        variant: "outline",
        tone,
        "aria-pressed": true,
        "aria-label": "Preview",
      });
      const button = getByRole("button");
      const selected = appearance(button);
      expect(selected.background).toContain("/ 0.1875)");
      for (const variant of ["outline", "ghost"] as const) {
        await rerender({ variant });
        await userEvent.hover(button);
        await expect.poll(() => appearance(button)).toEqual(selected);
        button.focus();
        await userEvent.keyboard("[Space>]");
        await expect.poll(() => appearance(button)).toEqual(selected);
        await userEvent.keyboard("[/Space]");
      }
      await rerender({ disabled: true });
      await expect.poll(() => getComputedStyle(button).boxShadow).toBe("none");
    }
  );

  it("gives quiet links the same hover layer without filling inline links", async () => {
    const { getByRole, rerender } = render(Link, {
      href: "#help",
      variant: "inline",
      children: createRawSnippet(() => ({ render: () => "<span>Help</span>" })),
    });
    const link = getByRole("link");
    const inlineBackground = getComputedStyle(link).backgroundColor;
    await rerender({ variant: "quiet" });
    await userEvent.hover(link);
    await expect.poll(() => getComputedStyle(link).backgroundColor).toBe(tokenColor("--color-action-subtle-hover"));
    await rerender({ variant: "inline" });
    await expect.poll(() => getComputedStyle(link).backgroundColor).toBe(inlineBackground);
  });
});
