import ActionMenu from "./ActionMenu.svelte";

import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("ActionMenu", () => {
  it("opens with focus, skips disabled actions, and restores trigger focus", async () => {
    const onSelect = vi.fn();
    const { getByRole, queryByRole } = render(ActionMenu, {
      props: {
        label: "Item actions",
        items: [
          { id: "rename", label: "Rename" },
          { id: "archive", label: "Archive", disabled: true },
          { id: "delete", label: "Delete", onSelect },
        ],
      },
    });

    const trigger = getByRole("button", { name: "Item actions" });
    expect(queryByRole("menu")).toBeNull();

    await fireEvent.click(trigger);

    const rename = getByRole("menuitem", { name: "Rename" });
    const remove = getByRole("menuitem", { name: "Delete" });
    await waitFor(() => expect(document.activeElement).toBe(rename));

    await fireEvent.keyDown(rename, { key: "ArrowDown" });
    expect(document.activeElement).toBe(remove);

    await fireEvent.click(remove);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
