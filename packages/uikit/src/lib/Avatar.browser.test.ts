/// <reference types="vite/client" />
import Avatar from "./Avatar.svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

describe("Avatar sizes", () => {
  it.each([
    { width: 320, diameter: 64, fontSize: 20.25 },
    { width: 1280, diameter: 96, fontSize: 22.78 },
  ])("sizes a profile picture $diameter px wide at $width px", async ({ width, diameter, fontSize }) => {
    await page.viewport(width, 800);
    const { getByRole } = render(Avatar, { label: "Ada Lovelace", size: "xl" });
    const initials = getByRole("img", { name: "Ada Lovelace" });
    const avatar = initials.parentElement!;

    expect(avatar.getBoundingClientRect().width).toBe(diameter);
    expect(avatar.getBoundingClientRect().height).toBe(diameter);
    expect(parseFloat(getComputedStyle(avatar).fontSize)).toBeCloseTo(fontSize, 1);
  });
});
