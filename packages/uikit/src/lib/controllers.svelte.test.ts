import { createComboboxController, createOpenController, createSelectController } from "./controllers.svelte";

import { describe, expect, it, vi } from "vitest";

describe("component controllers", () => {
  it("applies semantic open transitions without duplicate notifications", () => {
    const onOpenChange = vi.fn();
    const controller = createOpenController({ onOpenChange });

    controller.open();
    controller.open();
    controller.toggle();
    controller.close();

    expect(controller.state.open).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("owns select visibility and value independently", () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const controller = createSelectController({
      initialValue: "private",
      onOpenChange,
      onValueChange,
    });

    controller.open();
    controller.select("organization");
    controller.close();

    expect(controller.state).toEqual({ open: false, value: "organization" });
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("organization");
  });

  it("clears a combobox query when it closes", () => {
    const onQueryChange = vi.fn();
    const controller = createComboboxController<string>({ onQueryChange });

    controller.open();
    controller.setQuery("eng");
    controller.close();

    expect(controller.state).toEqual({ open: false, query: "", value: undefined });
    expect(onQueryChange.mock.calls).toEqual([["eng"], [""]]);
  });
});
