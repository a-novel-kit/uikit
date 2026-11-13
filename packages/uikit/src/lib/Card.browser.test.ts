/// <reference types="vite/client" />
import NestedCardsFixture from "../../test/NestedCardsFixture.svelte";
import Card from "./Card.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it, onTestFinished } from "vitest";
import { userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

function resolveColor(value: string) {
  const sample = document.body.appendChild(document.createElement("span"));
  sample.style.backgroundColor = value;
  const color = getComputedStyle(sample).backgroundColor;
  sample.remove();
  return color;
}

/** Waits for the element's transitions, then reads its background. */
async function settledBackground(element: Element) {
  await Promise.all(element.getAnimations().map((animation) => animation.finished));
  return getComputedStyle(element).backgroundColor;
}

describe("Card", () => {
  it("lights a ghost card as a raised one once a link inside it takes the keyboard's focus", async () => {
    // The pointer rests at the page's corner, so the card sits away from it and only the focus can light it.
    const target = document.body.appendChild(document.createElement("div"));
    target.style.marginBlockStart = "50vh";
    onTestFinished(() => target.remove());
    const children = createRawSnippet(() => ({ render: () => '<a href="#project">Lantern</a>' }));
    const { container } = render(Card, { target, props: { surface: "ghost", children } });
    const card = container.querySelector(".card")!;
    const resting = await settledBackground(card);

    await userEvent.tab();

    expect(document.activeElement?.textContent).toBe("Lantern");
    expect(await settledBackground(card)).toBe(resolveColor("var(--color-surface-island-glass)"));
    expect(resting).not.toBe(resolveColor("var(--color-surface-island-glass)"));
  });

  it("rings a ghost card a step over a divider", () => {
    const children = createRawSnippet(() => ({ render: () => "<span>Lantern</span>" }));
    const { container } = render(Card, { props: { surface: "ghost", children } });
    const ring = getComputedStyle(container.querySelector(".card")!).boxShadow;

    expect(ring).toContain(resolveColor("var(--color-border-item)"));
    expect(ring).not.toContain(resolveColor("var(--color-border-divider)"));
  });

  it("pads a card by half its radius and gives a nested card the parent's radius less the padding", () => {
    const { container } = render(NestedCardsFixture);
    const outer = container.querySelector(".card")!;
    const nested = outer.querySelector(".card")!;
    const radius = (card: Element) => parseFloat(getComputedStyle(card).borderStartStartRadius);
    const padding = (card: Element) => parseFloat(getComputedStyle(card.querySelector(".content")!).paddingInlineStart);

    expect(padding(outer)).toBe(radius(outer) / 2);
    expect(radius(nested)).toBe(radius(outer) - padding(outer));
    expect(padding(nested)).toBe(radius(nested) / 2);
  });

  it("keeps a ghost card inside another card on its parent's glass", () => {
    const { container } = render(NestedCardsFixture);

    const nested = container.querySelector(".card .card")!;
    expect(getComputedStyle(nested).backdropFilter).toBe("none");
  });
});
