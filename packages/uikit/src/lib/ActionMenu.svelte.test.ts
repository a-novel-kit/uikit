import ActionMenu from "./ActionMenu.svelte";
import { createOpenController } from "./controllers.svelte";

import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("ActionMenu", () => {
  it("opens with focus, skips disabled actions, and restores trigger focus", async () => {
    const onSelect = vi.fn();
    const { getByRole, queryByRole } = render(ActionMenu, {
      props: {
        label: "Item actions",
        controller: createOpenController(),
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

  it("moves focus to the next enabled action matching typed characters", async () => {
    const { getByRole } = render(ActionMenu, {
      props: {
        label: "Item actions",
        controller: createOpenController(),
        items: [
          { id: "rename", label: "Rename" },
          { id: "archive", label: "Archive", disabled: true },
          { kind: "separator", id: "danger" },
          { id: "delete", label: "Delete" },
          { id: "duplicate", label: "Duplicate" },
        ],
      },
    });

    await fireEvent.keyDown(getByRole("button", { name: "Item actions" }), { key: "ArrowUp" });
    const duplicate = getByRole("menuitem", { name: "Duplicate" });
    await waitFor(() => expect(document.activeElement).toBe(duplicate));

    const remove = getByRole("menuitem", { name: "Delete" });
    await fireEvent.keyDown(duplicate, { key: "d" });
    expect(document.activeElement).toBe(remove);

    await fireEvent.keyDown(remove, { key: "u" });
    expect(document.activeElement).toBe(duplicate);

    await fireEvent.keyDown(duplicate, { key: "Home" });
    expect(document.activeElement).toBe(getByRole("menuitem", { name: "Rename" }));
  });
});
