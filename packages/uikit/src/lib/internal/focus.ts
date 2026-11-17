/** Returns the enabled descendants participating in a composite focus model. */
export function getEnabledCompositeItems(container: HTMLElement, selector = "[data-composite-item]"): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (item) => !item.matches(":disabled, [aria-disabled='true']")
  );
}

/** Returns the composite item that contains an event target, if any. */
export function closestCompositeItem(
  target: EventTarget | null,
  selector = "[data-composite-item]"
): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>(selector) : null;
}

/** Moves focus by one enabled item and optionally wraps at either edge. */
export function moveCompositeFocus(
  items: readonly HTMLElement[],
  current: HTMLElement,
  direction: -1 | 1,
  loop: boolean
): HTMLElement | undefined {
  const currentIndex = items.indexOf(current);
  if (currentIndex < 0) return undefined;

  const candidateIndex = currentIndex + direction;
  if (candidateIndex >= 0 && candidateIndex < items.length) return items[candidateIndex];
  if (!loop) return undefined;

  return direction === 1 ? items[0] : items.at(-1);
}

/**
 * Resolves the item that a navigation key moves focus to: Home and End reach either edge, and the
 * arrow keys of the orientation step by one item. Returns undefined for any other key.
 */
export function findCompositeTarget(
  items: readonly HTMLElement[],
  current: HTMLElement,
  key: string,
  orientation: "horizontal" | "vertical",
  loop: boolean
): HTMLElement | undefined {
  if (key === "Home") return items[0];
  if (key === "End") return items.at(-1);

  const [previousKey, nextKey] = orientation === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
  if (key === nextKey) return moveCompositeFocus(items, current, 1, loop);
  if (key === previousKey) return moveCompositeFocus(items, current, -1, loop);
  return undefined;
}
