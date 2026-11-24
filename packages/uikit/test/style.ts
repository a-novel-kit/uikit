/** Resolves a CSS color, such as a token reference, to the computed color a background takes under `parent`. */
export function resolveColor(value: string, parent: HTMLElement = document.body): string {
  const sample = document.createElement("span");
  sample.style.backgroundColor = value;
  parent.append(sample);
  const color = getComputedStyle(sample).backgroundColor;
  sample.remove();
  return color;
}

/** Paints CSS colors over each other on a canvas and reads the sRGB the browser shows, gamut mapping included. */
export function painted(...layers: string[]) {
  const context = document.createElement("canvas").getContext("2d")!;
  for (const layer of layers) {
    context.fillStyle = layer;
    context.fillRect(0, 0, 1, 1);
  }
  return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
}

/** WCAG 2 relative luminance of a painted sRGB color. */
export function luminance(channels: number[]) {
  return channels
    .map((channel) => channel / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

/** WCAG 2 contrast ratio of two painted sRGB colors. */
export function contrast(first: number[], second: number[]) {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

/** Waits for the element's transitions and animations to finish, then returns its computed style. */
export async function settledStyle(element: Element): Promise<CSSStyleDeclaration> {
  await Promise.all(element.getAnimations().map((animation) => animation.finished));
  return getComputedStyle(element);
}

/** Resolves with the anchor width that the next floating surface carries as it shows, before its first paint. */
export function anchorWidthOnShow(): Promise<string> {
  return new Promise((resolve) => {
    const read = (event: Event) =>
      resolve((event.target as HTMLElement).style.getPropertyValue("--floating-anchor-width"));
    document.addEventListener("beforetoggle", read, { capture: true, once: true });
  });
}
