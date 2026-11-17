/** Reads an element's text with template whitespace, and the narrow spaces Intl puts in times, collapsed. */
export function text(element: HTMLElement): string {
  return element.textContent?.replace(/\s+/g, " ").trim() ?? "";
}
