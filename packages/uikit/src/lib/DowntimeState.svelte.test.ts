import DowntimeState from "./DowntimeState.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

const end = new Date("2026-10-12T07:00:00Z");

// Collapses template whitespace and the narrow spaces Intl puts in times.
function text(element: HTMLElement): string {
  return element.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

describe("DowntimeState", () => {
  it("explains that the page is unavailable until its expected end", () => {
    const { getByRole } = render(DowntimeState, { end, locale: "en-US", timeZone: "UTC", headingLevel: 1 });

    expect(getByRole("heading", { level: 1, name: "Temporarily unavailable" })).toBeTruthy();
    expect(text(getByRole("status"))).toMatch(
      "This page is unavailable during maintenance. Expected to end: Oct 12, 2026, 7:00 AM UTC."
    );
  });

  it("takes localized wording that receives the expected end, and actions", () => {
    const { getByRole } = render(DowntimeState, {
      end,
      locale: "fr-FR",
      timeZone: "UTC",
      title: "Momentanément indisponible",
      message: createRawSnippet((when: () => string) => ({
        render: () => `<span>Fin prévue : ${when()}.</span>`,
      })),
      actions: createRawSnippet(() => ({ render: () => '<a href="/">Accueil</a>' })),
    });

    expect(getByRole("heading", { level: 2, name: "Momentanément indisponible" })).toBeTruthy();
    expect(text(getByRole("status"))).toMatch("Fin prévue : 12 oct. 2026, 07:00 UTC.");
    expect(getByRole("link", { name: "Accueil" })).toBeTruthy();
  });
});
