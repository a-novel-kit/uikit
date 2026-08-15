import type { SelectionOption } from "./types";

import type { HTMLInputAttributes } from "svelte/elements";

/** Finds the first enabled option from either edge of a selection list. */
export function findEnabledBoundary<Value extends string>(
  options: readonly SelectionOption<Value>[],
  boundary: "first" | "last"
): number {
  const start = boundary === "first" ? 0 : options.length - 1;
  const direction = boundary === "first" ? 1 : -1;

  for (let index = start; index >= 0 && index < options.length; index += direction) {
    if (!options[index]?.disabled) return index;
  }

  return -1;
}

/** Finds the next enabled option and optionally wraps at either edge. */
export function findNextEnabledIndex<Value extends string>(
  options: readonly SelectionOption<Value>[],
  currentIndex: number,
  direction: -1 | 1,
  loop = true
): number {
  if (options.length === 0) return -1;

  let candidateIndex = currentIndex;
  for (let visited = 0; visited < options.length; visited += 1) {
    candidateIndex += direction;

    if (candidateIndex < 0 || candidateIndex >= options.length) {
      if (!loop) return currentIndex;
      candidateIndex = direction === 1 ? 0 : options.length - 1;
    }

    if (!options[candidateIndex]?.disabled) return candidateIndex;
  }

  return currentIndex;
}

/** Resolves explicit and ARIA validation state to one component state. */
export function resolveInvalidState(invalid: boolean, ariaInvalid: HTMLInputAttributes["aria-invalid"]): boolean {
  return invalid || ariaInvalid === true || ariaInvalid === "true";
}
