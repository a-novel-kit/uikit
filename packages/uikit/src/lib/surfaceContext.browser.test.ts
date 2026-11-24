/// <reference types="vite/client" />
import { resolveColor, settledStyle } from "../../test/style";
import Button from "./Button.svelte";
import Card from "./Card.svelte";
import Input from "./Input.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const label = createRawSnippet(() => ({ render: () => "<span>Archive</span>" }));

/** Renders a raised card and returns the region its content goes into. */
function inCard() {
  const { container } = render(Card, {
    props: { children: createRawSnippet(() => ({ render: () => "<div></div>" })) },
  });
  return container.querySelector<HTMLElement>(".content > div")!;
}

/** Returns an application's own island: any element that carries the marker, and the region inside it. */
function inOwnIsland() {
  const island = document.body.appendChild(document.createElement("section"));
  island.dataset.island = "";
  return island.appendChild(document.createElement("div"));
}

const thin = () => resolveLength("var(--border-width-thin)");
const strong = () => resolveLength("var(--border-width-strong)");

function resolveLength(value: string) {
  const sample = document.body.appendChild(document.createElement("span"));
  sample.style.borderInlineStart = `${value} solid`;
  const length = getComputedStyle(sample).borderInlineStartWidth;
  sample.remove();
  return length;
}

describe("what holds a control", () => {
  it("doubles a neutral outline on the canvas, where the veil is dimmest", async () => {
    const { getByRole } = render(Button, { variant: "outline", tone: "neutral", children: label });
    const style = await settledStyle(getByRole("button"));

    expect(style.borderTopWidth).toBe(strong());
    expect(style.borderTopColor).toBe(resolveColor("var(--color-veil)"));
  });

  it.each([
    ["a card", inCard],
    ["an island an application marks", inOwnIsland],
  ])("draws a neutral outline as a hairline in %s", async (_, mount) => {
    const { getByRole } = render(Button, {
      target: mount(),
      props: { variant: "outline", tone: "neutral", children: label },
    });

    expect((await settledStyle(getByRole("button"))).borderTopWidth).toBe(thin());
  });

  it("keeps a colored outline a hairline on the canvas, since it carries itself", async () => {
    const { getByRole } = render(Button, { variant: "outline", tone: "danger", children: label });

    expect((await settledStyle(getByRole("button"))).borderTopWidth).toBe(thin());
  });

  it("doubles a field's ring on the canvas", async () => {
    const { getByLabelText } = render(Input, { "aria-label": "Field" });

    expect((await settledStyle(getByLabelText("Field").parentElement!)).borderTopWidth).toBe(strong());
  });

  it("doubles a ghost card's ring on the canvas, and draws it as a hairline inside a card", () => {
    const ring = (target?: HTMLElement) =>
      getComputedStyle(render(Card, { target, props: { surface: "ghost" } }).container.querySelector(".card")!)
        .outlineWidth;

    expect(ring()).toBe(strong());
    expect(ring(inCard())).toBe(thin());
  });
});

describe("a disabled action", () => {
  it.each(["solid", "outline"] as const)("draws no outline as a %s button", async (variant) => {
    const { getByRole } = render(Button, { variant, tone: "neutral", disabled: true, children: label });

    expect((await settledStyle(getByRole("button"))).borderTopColor).toBe(resolveColor("transparent"));
  });

  it("fills with a slight gray on the canvas, apart from a field's well", async () => {
    const { getByRole } = render(Button, { disabled: true, children: label });
    const fill = (await settledStyle(getByRole("button"))).backgroundColor;

    expect(fill).toBe(resolveColor("var(--color-action-disabled-surface)"));
    expect(fill).not.toBe(resolveColor("var(--color-control-surface)"));
  });

  it.each([
    ["a card", inCard],
    ["an island an application marks", inOwnIsland],
  ])("fills with a field's well in %s", async (_, mount) => {
    const { getByRole } = render(Button, { target: mount(), props: { disabled: true, children: label } });

    expect((await settledStyle(getByRole("button"))).backgroundColor).toBe(
      resolveColor("var(--color-control-surface)")
    );
  });
});
