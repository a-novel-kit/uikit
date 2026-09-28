import type {
  CheckedController,
  ComboboxController,
  OpenController,
  PressedController,
  SelectController,
  ValueController,
} from "@a-novel-kit/uikit";

const ignore = () => {};

/** Pins overlay visibility while preserving native focus and pointer behavior. */
export function fixedOpen(open = false): OpenController {
  return { state: { open }, open: ignore, close: ignore, toggle: ignore };
}

/** Pins a checkbox or switch in its review state. */
export function fixedChecked(checked = false): CheckedController {
  return { state: { checked }, setChecked: ignore, toggle: ignore };
}

/** Pins a toggle button in its review state. */
export function fixedPressed(pressed = false): PressedController {
  return { state: { pressed }, setPressed: ignore, toggle: ignore };
}

/** Pins a tab, radio group, or slider value. */
export function fixedValue<Value>(value: Value): ValueController<Value> {
  return { state: { value }, setValue: ignore };
}

/** Composes fixed visibility and selection for a popup control. */
export function fixedSelect<Value extends string>(value?: Value, open = false): SelectController<Value> {
  return { ...fixedOpen(open), state: { open, value }, select: ignore };
}

/** Adds a fixed filter query to the selection preview. */
export function fixedCombobox<Value extends string>(
  value?: Value,
  open = false,
  query = ""
): ComboboxController<Value> {
  return { ...fixedSelect(value, open), state: { open, value, query }, setQuery: ignore };
}
