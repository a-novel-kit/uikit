import Tabs from "./Tabs.svelte";
import type { TabItem } from "./Tabs.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it, vi } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

const tabs = [
  { value: "profile", label: "Profile" },
  { value: "security", label: "Security" },
  { value: "billing", label: "Billing", disabled: true },
] satisfies TabItem[];

const panel = createRawSnippet<[TabItem]>((tab) => ({
  render: () => "<p>" + tab().label + " panel</p>",
}));

describe("Tabs", () => {
  it("moves focus, skips disabled tabs, and activates automatically", async () => {
    const onValueChange = vi.fn();
    const { getByRole } = render(Tabs, {
      props: {
        label: "Account",
        tabs,
        value: "profile",
        children: panel,
        onValueChange,
      },
    });

    const profile = getByRole("tab", { name: "Profile" });
    const security = getByRole("tab", { name: "Security" });
    profile.focus();

    await fireEvent.keyDown(profile, { key: "ArrowRight" });

    expect(document.activeElement).toBe(security);
    expect(security.getAttribute("aria-selected")).toBe("true");
    expect(getByRole("tabpanel").textContent).toContain("Security panel");
    expect(onValueChange).toHaveBeenCalledWith("security");

    await fireEvent.keyDown(security, { key: "ArrowRight" });
    expect(document.activeElement).toBe(profile);
  });

  it("waits for activation in manual mode", async () => {
    const { getByRole } = render(Tabs, {
      props: {
        label: "Account",
        tabs,
        value: "profile",
        activationMode: "manual",
        children: panel,
      },
    });

    const profile = getByRole("tab", { name: "Profile" });
    const security = getByRole("tab", { name: "Security" });
    profile.focus();

    await fireEvent.keyDown(profile, { key: "ArrowRight" });
    expect(document.activeElement).toBe(security);
    expect(profile.getAttribute("aria-selected")).toBe("true");
    expect(profile.tabIndex).toBe(-1);
    expect(security.tabIndex).toBe(0);

    await fireEvent.keyDown(security, { key: "Enter" });
    expect(security.getAttribute("aria-selected")).toBe("true");
  });
});
