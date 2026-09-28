/// <reference types="vite/client" />
import Button from "./Button.svelte";
import Link from "./Link.svelte";

import { createRawSnippet } from "svelte";

import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

function resolveColor(value: string, foreground = "") {
  const sample = document.createElement("span");
  sample.style.backgroundColor = value;
  sample.style.color = foreground;
  document.body.append(sample);
  const color = getComputedStyle(sample).backgroundColor;
  sample.remove();
  return color;
}

async function expectFeedback(element: HTMLElement, opacity: string) {
  await Promise.all(element.getAnimations().map((animation) => animation.finished));
  const { backgroundColor, color } = getComputedStyle(element);
  expect(backgroundColor).toBe(resolveColor(`color-mix(in oklab, currentColor var(${opacity}), transparent)`, color));
}

function appearance(element: HTMLElement) {
  const css = getComputedStyle(element);
  return { background: css.backgroundColor, border: css.borderColor, color: css.color, shadow: css.boxShadow };
}

beforeEach(async () => userEvent.unhover(document.body));

describe("low-emphasis action feedback", () => {
  for (const variant of ["outline", "ghost"] as const) {
    it.each(["brand", "neutral", "danger"] as const)(
      `${variant} %s keeps hover and active layers in its own color family`,
      async (tone) => {
        const { getByRole, rerender } = render(Button, { variant, tone, "aria-label": "Save" });
        const button = getByRole("button");
        await userEvent.hover(button);
        await expectFeedback(button, "--color-mix-2");
        const activeForeground = getComputedStyle(button).color;

        await userEvent.unhover(button);
        button.focus();
        await userEvent.keyboard("[Space>]");
        await expectFeedback(button, "--color-mix-3");
        await expect.poll(() => getComputedStyle(button).color).toBe(activeForeground);
        await userEvent.keyboard("[/Space]");
        expect(parseFloat(getComputedStyle(button).outlineWidth)).toBeGreaterThan(0);

        await rerender({ disabled: true });
        await expect
          .poll(() => getComputedStyle(button).backgroundColor)
          .toBe(resolveColor("var(--color-action-disabled-surface)"));
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

  it("tints quiet-link hover with its text color without filling inline links", async () => {
    const { getByRole, rerender } = render(Link, {
      href: "#help",
      variant: "inline",
      children: createRawSnippet(() => ({ render: () => "<span>Help</span>" })),
    });
    const link = getByRole("link");
    const inlineBackground = getComputedStyle(link).backgroundColor;
    await rerender({ variant: "quiet" });
    await userEvent.hover(link);
    await expectFeedback(link, "--color-mix-2");
    await rerender({ variant: "inline" });
    await expect.poll(() => getComputedStyle(link).backgroundColor).toBe(inlineBackground);
  });
});
