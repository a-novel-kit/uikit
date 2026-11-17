import type {
  CheckedController,
  ChipGroupController,
  ComboboxController,
  ConsentController,
  OpenController,
  PressedController,
  SelectController,
  TagInputController,
  ValueController,
} from "@a-novel-kit/uikit";

const ignore = () => {};

/** Pins overlay visibility while preserving native focus and pointer behavior. */
export function fixedOpen(open = false): OpenController {
  return { state: { open }, open: ignore, close: ignore, toggle: ignore };
}

/** Pins a consent request's visibility; answers leave it as it is. */
export function fixedConsent(open = true): ConsentController {
  return { state: { open }, open: ignore, accept: ignore, decline: ignore };
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

/** Pins a chip group's choice, search, and whether its narrow-screen view is open. */
export function fixedChips(value: readonly string[], query = "", open = false): ChipGroupController {
  return { ...fixedOpen(open), state: { value, query, open }, setValue: ignore, setQuery: ignore };
}

/** Pins a tag input's tags: it refuses every tag, so what is typed stays in the field. */
export function fixedTags(tags: readonly string[] = []): TagInputController {
  return { state: { tags }, add: () => false, remove: ignore };
}
