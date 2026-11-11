/**
 * Runs that cannot sit inside a tag: anything but lowercase, modifier or caseless letters, marks, decimal digits and
 * the zero-width joiners. Marks, modifier letters and joiners keep whole the words of scripts that write with them,
 * as Thai, Hindi, Persian or Japanese do.
 */
const separators = /[^\p{Ll}\p{Lm}\p{Lo}\p{M}\p{Nd}\u200C\u200D]+/u;

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
