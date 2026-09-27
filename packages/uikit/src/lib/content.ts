import type { Snippet } from "svelte";

/**
 * Escaped text or a Svelte snippet rendered in a component-owned semantic region.
 * Use a snippet for markup or nested components; strings are never interpreted as HTML.
 * Snippet markup must fit its destination, such as phrasing content inside a heading.
 */
export type Content = string | Snippet;
