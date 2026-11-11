/// <reference types="vite/client" />
import Button from "./Button.svelte";
import Link from "./Link.svelte";

import { createRawSnippet } from "svelte";

import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-fonts/fonts.css";
import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

function resolveColor(value: string, parent: HTMLElement = document.body) {
  const sample = document.createElement("span");
  sample.style.backgroundColor = value;
  parent.append(sample);
  const color = getComputedStyle(sample).backgroundColor;
  sample.remove();
  return color;
}

async function expectFeedback(element: HTMLElement, opacity: string) {
  await Promise.all(element.getAnimations().map((animation) => animation.finished));
  expect(getComputedStyle(element).backgroundColor).toBe(
    resolveColor(`color-mix(in oklab, currentColor var(${opacity}), transparent)`, element)
  );
}

function appearance(element: HTMLElement) {
  const css = getComputedStyle(element);
  return { background: css.backgroundColor, border: css.borderColor, color: css.color, shadow: css.boxShadow };
}

beforeEach(async () => userEvent.unhover(document.body));

describe("low-emphasis action feedback", () => {
  for (const variant of ["outline", "ghost", "text"] as const) {
    it.each(["brand", "neutral", "danger"] as const)(
      `${variant} %s keeps hover and active layers in its own color family`,
      async (tone) => {
        const { getByRole, rerender } = render(Button, { variant, tone, "aria-label": "Save" });
        const button = getByRole("button");
        const restingChromaticity = resolveColor("oklch(from currentColor 0.5 c h)", button);
        await userEvent.hover(button);
        await expectFeedback(button, "--color-mix-2");
        const activeForeground = getComputedStyle(button).color;
        expect(resolveColor("oklch(from currentColor 0.5 c h)", button)).toBe(restingChromaticity);

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

  /** Hovers and presses the button, and expects its look to stay the one it had. */
  async function expectSteady(button: HTMLElement, look: ReturnType<typeof appearance>) {
    await userEvent.hover(button);
    await expect.poll(() => appearance(button)).toEqual(look);
    button.focus();
    await userEvent.keyboard("[Space>]");
    await expect.poll(() => appearance(button)).toEqual(look);
    await userEvent.keyboard("[/Space]");
  }

  it.each(["brand", "neutral", "danger"] as const)(
    "keeps an outline %s selection in its own color across pointer states",
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
      await expectSteady(button, selected);
      await rerender({ disabled: true });
      await expect.poll(() => getComputedStyle(button).boxShadow).toBe("none");
    }
  );

  it.each(["brand", "neutral", "danger"] as const)(
    "turns a chosen ghost or text %s button blue, as the navigation's current item, without a border or glow",
    async (tone) => {
      const chosen = {
        background: resolveColor("var(--color-navigation-selected-surface)"),
        border: resolveColor("transparent"),
        color: resolveColor("var(--color-navigation-selected-text)"),
        shadow: "none",
      };
      const { getByRole, rerender } = render(Button, {
        variant: "ghost",
        tone,
        "aria-pressed": true,
        "aria-label": "Preview",
      });
      const button = getByRole("button");
      for (const variant of ["ghost", "text"] as const) {
        await rerender({ variant });
        await expect.poll(() => appearance(button)).toEqual(chosen);
        await expectSteady(button, chosen);
      }
    }
  );

  it("keeps a text button as regular-weight colored text until it is hovered", async () => {
    const { getByRole } = render(Button, { variant: "text", "aria-label": "Forgot password" });
    const button = getByRole("button");
    const css = getComputedStyle(button);
    expect(css.fontWeight).toBe(
      getComputedStyle(document.documentElement).getPropertyValue("--font-weight-regular").trim()
    );
    expect(css.backgroundColor).toBe(resolveColor("transparent"));
    expect(css.color).toBe(resolveColor("var(--color-action-primary-foreground)"));
  });

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

describe("chosen toggles", () => {
  it.each(["ghost", "text"] as const)(
    "marks a chosen %s toggle with an indicator no hover draws, and keeps a disabled choice visible",
    async (variant) => {
      const { getByRole, rerender } = render(Button, { variant, "aria-pressed": false, "aria-label": "Snap" });
      const button = getByRole("button");
      await userEvent.hover(button);
      expect(getComputedStyle(button, "::before").content).toBe("none");

      await rerender({ "aria-pressed": true });
      expect(getComputedStyle(button, "::before").content).not.toBe("none");

      await rerender({ "aria-pressed": true, disabled: true });
      await expect
        .poll(() => getComputedStyle(button).backgroundColor)
        .toBe(resolveColor("var(--color-navigation-selected-surface)"));
      expect(Number(getComputedStyle(button).opacity)).toBeLessThan(1);
      expect(getComputedStyle(button, "::before").boxShadow).toBe("none");
    }
  );
});

describe("borderless buttons", () => {
  it.each(["ghost", "text"] as const)("keeps a disabled %s button borderless", (variant) => {
    const { getByRole } = render(Button, { variant, disabled: true, "aria-label": "Preview" });

    expect(getComputedStyle(getByRole("button")).borderColor).toBe(resolveColor("transparent"));
  });
});

describe("label centering", () => {
  it.each([
    ["normal", 400],
    ["normal", 700],
    ["italic", 400],
    ["italic", 700],
  ])("sets the interface face's %s %i capitals mid-line", async (style, weight) => {
    const font = `${style} ${weight} 100px "TeX Gyre Heros"`;
    await document.fonts.load(font);
    const context = document.createElement("canvas").getContext("2d")!;
    context.font = font;
    const metrics = context.measureText("H");

    // A flex button centres the line box, so its label's capitals sit mid-line once ascent minus descent
    // matches their height. The 2% margin centres them after browsers snap the baseline to a pixel.
    const margin = metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent - metrics.actualBoundingBoxAscent;
    expect(margin).toBeGreaterThanOrEqual(1);
    expect(margin).toBeLessThanOrEqual(3);
  });
});
