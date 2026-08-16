/** Returns the enabled descendants participating in a composite focus model. */
export function getEnabledCompositeItems(container: HTMLElement, selector = "[data-composite-item]"): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (item) => !item.matches(":disabled, [aria-disabled='true']")
  );
}

/** Moves focus by one enabled item and optionally wraps at either edge. */
export function moveCompositeFocus(
  items: readonly HTMLElement[],
  current: HTMLElement,
  direction: -1 | 1,
  loop: boolean
): HTMLElement | undefined {
  const currentIndex = items.indexOf(current);
  if (currentIndex < 0 || items.length === 0) return undefined;

  const candidateIndex = currentIndex + direction;
  if (candidateIndex >= 0 && candidateIndex < items.length) return items[candidateIndex];
  if (!loop) return undefined;

  return direction === 1 ? items[0] : items.at(-1);
}
