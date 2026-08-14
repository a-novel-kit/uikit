import type { SelectionOption } from "./types";

import type { HTMLInputAttributes } from "svelte/elements";

/** Copies readonly options into the mutable item shape expected by composite controls. */
export function toSelectionItems<Value extends string>(
  options: readonly SelectionOption<Value>[]
): SelectionOption<Value>[] {
  return options.map((option) => ({ ...option }));
}

/** Converts a composite control's empty sentinel back to an optional application value. */
export function normalizeSelectionValue<Value extends string>(value: string): Value | undefined {
  return value === "" ? undefined : (value as Value);
}

/** Resolves explicit and ARIA validation state to one component state. */
export function resolveInvalidState(invalid: boolean, ariaInvalid: HTMLInputAttributes["aria-invalid"]): boolean {
  return invalid || ariaInvalid === true || ariaInvalid === "true";
}
