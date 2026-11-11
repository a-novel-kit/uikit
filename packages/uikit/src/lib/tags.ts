/** Runs that cannot sit inside a tag: anything but lowercase or caseless letters and decimal digits. */
const separators = /[^\p{Ll}\p{Lo}\p{Nd}]+/u;

/**
 * Turns text into a lower-kebab-case tag: lowercase letters, caseless letters and digits, in runs joined by single
 * hyphens. Text without any of them gives an empty string.
 *
 * @example
 * ```ts
 * import { kebabTag } from "@a-novel-kit/uikit";
 * kebabTag("Années 50"); // "années-50"
 * ```
 */
export function kebabTag(text: string): string {
  return text.normalize("NFC").toLowerCase().split(separators).filter(Boolean).join("-");
}
