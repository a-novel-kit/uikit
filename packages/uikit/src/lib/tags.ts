/**
 * Runs that cannot sit inside a tag: anything but lowercase, modifier or caseless letters, marks and decimal digits.
 * Marks and modifier letters keep whole the words of scripts that write with them, as Thai, Hindi or Japanese do.
 */
const separators = /[^\p{Ll}\p{Lm}\p{Lo}\p{M}\p{Nd}]+/u;

/**
 * Turns text into a lower-kebab-case tag: lowercase, modifier and caseless letters, marks and digits, in runs joined
 * by single hyphens, precomposed (NFC). Text without any of them gives an empty string.
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
