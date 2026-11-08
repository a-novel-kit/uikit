import {
  createCheckedController,
  createComboboxController,
  createOpenController,
  createPictureFrameController,
  createPressedController,
  createSelectController,
  createValueController,
} from "./controllers.svelte";

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
    controller.select("organization");
    controller.toggle();

    expect(controller.state).toEqual({ open: false, value: "organization" });
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("organization");
  });

  it("clears a combobox query when it closes", () => {
    const onQueryChange = vi.fn();
    const controller = createComboboxController<string>({ onQueryChange });

    controller.toggle();
    controller.setQuery("eng");
    controller.setQuery("eng");
    controller.close();

    expect(controller.state).toEqual({ open: false, query: "", value: undefined });
    expect(onQueryChange.mock.calls).toEqual([["eng"], [""]]);
  });

  it("applies checked and pressed transitions through their semantic methods", () => {
    const onCheckedChange = vi.fn();
    const checked = createCheckedController({ onCheckedChange });
    const onPressedChange = vi.fn();
    const pressed = createPressedController({ initialPressed: true, onPressedChange });

    checked.setChecked(true);
    checked.setChecked(true);
    checked.toggle();
    pressed.setPressed(false);
    pressed.setPressed(false);
    pressed.toggle();

    expect(checked.state.checked).toBe(false);
    expect(pressed.state.pressed).toBe(true);
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
    expect(onPressedChange.mock.calls).toEqual([[false], [true]]);
  });

  it("applies single-value changes once", () => {
    const onValueChange = vi.fn();
    const controller = createValueController({ initialValue: 72, onValueChange });

    controller.setValue(90);
    controller.setValue(90);

    expect(controller.state.value).toBe(90);
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith(90);
  });

  it("frames a source from its center, then keeps the image over the frame", () => {
    const source = { url: "landscape.png", width: 1600, height: 1200 };
    const controller = createPictureFrameController({ source, ratio: { width: 16, height: 9 } });
    expect(controller.state).toEqual({ source, ratio: { width: 16, height: 9 }, crop: { zoom: 1, x: 0, y: 150 } });

    controller.zoom(2);
    controller.pan(0.1, 0.1);
    expect(controller.state.crop).toEqual({ zoom: 2, x: 320, y: 295 });

    controller.zoom(9, 0, 0);
    controller.pan(-3, -3);
    expect(controller.state.crop).toEqual({ zoom: 4, x: 1200, y: 975 });
  });
});
