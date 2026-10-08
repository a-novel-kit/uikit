/** Formats the times of a planned maintenance, in one language and time zone. */
export interface DowntimeFormat {
  /** Formats one instant, such as the expected end. */
  instant: (date: Date) => string;
  /** Formats a time frame, collapsing what both ends share. */
  range: (start: Date, end: Date) => string;
}

/**
 * Formats the times of a planned maintenance. The time zone is always named, so no reader guesses
 * which one applies; that rules out `dateStyle`, which can't be combined with `timeZoneName`.
 */
export function downtimeFormat(language: string, timeZone?: string): DowntimeFormat {
  const format = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  });

  // Keeps each time beside its date and zone on one line. A range still wraps at the thin spaces
  // around its dash.
  const unbroken = (text: string) => text.replaceAll(" ", " ");

  return {
    instant: (date) => unbroken(format.format(date)),
    range: (start, end) => unbroken(format.formatRange(start, end)),
  };
}
