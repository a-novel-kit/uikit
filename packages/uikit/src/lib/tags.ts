/** Where TagInput ends a tag: whitespace, and Latin, Arabic, ideographic or full-width commas. */
const tagSeparators = /[\s,\u060c\u3001\uff0c]+/u;

/**
 * Splits typed text where a TagInput ends a tag: whitespace, and Latin, Arabic, ideographic or full-width commas. A
 * server that reads a TagInput's form entries splits each with it before `kebabTag`, as the field does.
 *
 * @example
 * ```ts
 * import { kebabTag, splitTags } from "@a-novel-kit/uikit";
 * const tags = [...new Set(form.getAll("tags").flatMap((entry) => splitTags(String(entry))).map(kebabTag).filter(Boolean))];
 * ```
 */
export function splitTags(text: string): string[] {
  return text.split(tagSeparators);
}

/** Lowercase, modifier and caseless letters and decimal digits: what a tag's word starts with. */
const rune = String.raw`\p{Ll}\p{Lm}\p{Lo}\p{Nd}`;

/**
 * A word of a tag starts with a letter or digit and may go on with marks and the zero-width joiners, which keep whole
 * the words of scripts that write with them, as Thai, Hindi, Persian or Japanese do. A mark or joiner left alone, as
 * an emoji's variation selector is, starts no word; after a letter or digit it stays, so a keycap digit keeps its
 * keycap.
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
  // Lowercasing comes first: some capitals have no precomposed form with their mark while their lowercase does, so
  // normalizing after it keeps every tag precomposed, as the server requires.
  return text.toLowerCase().normalize("NFC").match(word)?.join("-") ?? "";
}
