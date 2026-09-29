/// <reference types="vite/client" />
import Button from "./Button.svelte";
import NavList from "./NavList.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

describe("NavList", () => {
  it.each(["canvas", "island", "island-strong"])(
    "shares ghost-button hover feedback on the %s surface without changing selection",
    async (surface) => {
      const { container, getByRole, getByText } = render(NavList, {
        items: [
          { href: "#home", label: "Home", current: true },
          { href: "#account", label: "Account" },
          { href: "#unavailable", label: "Unavailable", disabled: true },
        ],
      });
      container.style.backgroundColor = `var(--color-surface-${surface})`;
      const { getByRole: getAction } = render(Button, { variant: "ghost", tone: "neutral", "aria-label": "Logout" });
      const button = getAction("button");
      await userEvent.hover(button);
      await Promise.all(button.getAnimations().map((animation) => animation.finished));
      const feedback = getComputedStyle(button).backgroundColor;

      const account = getByRole("link", { name: "Account" });
      await userEvent.hover(account);
      await expect.poll(() => getComputedStyle(account).backgroundColor).toBe(feedback);
      expect(feedback).not.toBe(getComputedStyle(container).backgroundColor);

      for (const unchanged of [getByRole("link", { name: "Home" }), getByText("Unavailable")]) {
        const background = getComputedStyle(unchanged).backgroundColor;
        await userEvent.hover(unchanged);
        await Promise.all(unchanged.getAnimations().map((animation) => animation.finished));
        expect(getComputedStyle(unchanged).backgroundColor).toBe(background);
      }
    }
  );

  it("preserves accessible destinations, disabled state, and text-only items", async () => {
    await page.viewport(320, 800);
    const icon = createRawSnippet(() => ({ render: () => '<svg width="20" height="20"></svg>' }));
    const { getByRole, getByText, queryByRole, rerender } = render(NavList, {
      compact: true,
      items: [
        { href: "#home", label: "Home", icon, current: true },
        { href: "#team", label: "Team", icon, badge: 8 },
        { href: "#disabled", label: "Settings", icon, disabled: true },
        { href: "#help", label: "Help" },
      ],
    });
    const home = getByRole("link", { name: "Home" });
    expect(home.getAttribute("aria-current")).toBe("page");
    expect(getByRole("link", { name: "Team 8" }).getAttribute("href")).toBe("#team");
    expect(queryByRole("link", { name: "Settings" })).toBeNull();
    expect(getByText("Settings").closest('[aria-disabled="true"]')).not.toBeNull();
    expect(getComputedStyle(getByText("Home")).position).toBe("absolute");
    expect(getComputedStyle(getByText("Help")).position).toBe("static");
    const iconBounds = home.querySelector("svg")!.getBoundingClientRect();
    expect(iconBounds.left + iconBounds.width / 2).toBe(home.getBoundingClientRect().left + home.clientWidth / 2);
    await rerender({ compact: false });
    expect(getComputedStyle(getByText("Home")).position).toBe("static");
    expect(home.getAttribute("title")).toBeNull();
  });
});
