/// <reference types="vite/client" />
import NavList from "./NavList.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

describe("NavList compact presentation", () => {
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
