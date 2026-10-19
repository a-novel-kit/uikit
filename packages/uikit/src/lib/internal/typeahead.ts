/** Lowercase characters typed in quick succession, which listboxes and menus match against labels. */
export interface Typeahead {
  /** Appends a typed character and returns the query so far. */
  type(key: string): string;
  /** Cancels the pending reset; call it when the owning component is destroyed. */
  dispose(): void;
}

/** Creates a typeahead query that resets half a second after the last typed character. */
export function createTypeahead(): Typeahead {
  let query = "";
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  return {
    type(key) {
      clearTimeout(resetTimer);
      query += key.toLocaleLowerCase();
      resetTimer = setTimeout(() => (query = ""), 500);
      return query;
    },
    dispose: () => clearTimeout(resetTimer),
  };
}

/** Reports whether a key press types a character, as opposed to a named key or a shortcut. */
export function isTypeaheadKey(event: KeyboardEvent): boolean {
  return !event.altKey && !event.ctrlKey && !event.metaKey && event.key.length === 1;
}

/**
 * Finds the first label after `start` that begins with `query`, wrapping around the list once.
 * An undefined label never matches. Returns -1 when no label matches.
 */
export function findTypeaheadMatch(labels: readonly (string | undefined)[], start: number, query: string): number {
  for (let offset = 1; offset <= labels.length; offset += 1) {
    const index = (Math.max(start, -1) + offset) % labels.length;
    if (labels[index]?.toLocaleLowerCase().startsWith(query)) return index;
  }

  return -1;
}
