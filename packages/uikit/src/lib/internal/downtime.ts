/**
 * Formats the times of a planned maintenance. The time zone is always named, so no reader guesses
 * which one applies; that rules out `dateStyle`, which can't be combined with `timeZoneName`.
 */
export function downtimeFormat(locale?: Intl.LocalesArgument, timeZone?: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  });
}
