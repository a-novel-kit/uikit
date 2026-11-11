/** Lowercase, modifier and caseless letters and decimal digits: what a tag's word starts with. */
const rune = String.raw`\p{Ll}\p{Lm}\p{Lo}\p{Nd}`;

/**
 * A word of a tag starts with a letter or digit and may go on with marks and the zero-width joiners, which keep whole
 * the words of scripts that write with them, as Thai, Hindi, Persian or Japanese do. A mark or joiner left alone, as
 * an emoji's variation selector is, starts no word.
 */
const word = new RegExp(String.raw`[${rune}](?:[${rune}\p{M}\u200C\u200D]*[${rune}\p{M}])?`, "gu");

/**
 * Turns text into a lower-kebab-case tag: its words, precomposed (NFC), joined by single hyphens. A word holds
 * lowercase, modifier and caseless letters, digits, and the marks and joiners inside it. Text without any word gives
 * an empty string.
 *
 * @example
 * ```ts
 * import { kebabTag } from "@a-novel-kit/uikit";
 * kebabTag("Années 50"); // "années-50"
 * ```
 */
export function kebabTag(text: string): string {
  return text.normalize("NFC").toLowerCase().match(word)?.join("-") ?? "";
}
