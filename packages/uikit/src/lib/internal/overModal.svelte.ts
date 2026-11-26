import type { Snippet } from "svelte";

/**
 * Requests the reader must stay able to answer over a modal dialog, such as a consent banner, and the modal dialogs
 * open, the topmost last. A modal dialog makes every node outside it inert, the top layer included (HTML, "blocked by a
 * modal dialog"), so the topmost one renders each request inside itself as well, in the page or in a shadow root. As
 * module state, the lists hold one copy of uikit: a request of another copy, as an interface embedding its own may
 * show, stays inert under this copy's dialog until it closes, since no copy can render another's snippets.
 */
export const overModal = $state<{ requests: Snippet[]; dialogs: symbol[] }>({ requests: [], dialogs: [] });

/** Adds an item to a list, such as one of these, and returns what takes it out again. */
export function hold<Item>(list: Item[], item: Item): () => void {
  list.push(item);
  return () => {
    const index = list.indexOf(item);
    if (index >= 0) list.splice(index, 1);
  };
}
