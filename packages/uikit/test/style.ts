/** Resolves a CSS color, such as a token reference, to the computed color a background takes under `parent`. */
export function resolveColor(value: string, parent: HTMLElement = document.body): string {
  const sample = document.createElement("span");
  sample.style.backgroundColor = value;
  parent.append(sample);
  const color = getComputedStyle(sample).backgroundColor;
  sample.remove();
  return color;
}

/** Waits for the element's transitions and animations to finish, then returns its computed style. */
export async function settledStyle(element: Element): Promise<CSSStyleDeclaration> {
  await Promise.all(element.getAnimations().map((animation) => animation.finished));
  return getComputedStyle(element);
}

/** Resolves with the anchor width, in `property`, that the next floating surface carries as it shows, before its first paint. */
export function anchorWidthOnShow(property: string): Promise<string> {
  return new Promise((resolve) => {
    const read = (event: Event) => resolve((event.target as HTMLElement).style.getPropertyValue(property));
    document.addEventListener("beforetoggle", read, { capture: true, once: true });
  });
}
