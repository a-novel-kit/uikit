import I18nFixture from "../../test/I18nFixture.svelte";
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
    const { getByRole } = render(DowntimeState, { end, timeZone: "UTC", headingLevel: 1 });

    expect(getByRole("heading", { level: 1, name: "Temporarily unavailable" })).toBeTruthy();
    expect(text(getByRole("status"))).toMatch(
      "This page is unavailable during maintenance. Expected to end: Oct 12, 2026, 7:00 AM UTC."
    );
  });

  it("speaks French in a French app, and renders actions", () => {
    const { getByRole } = render(I18nFixture, {
      props: {
        locale: "fr",
        component: DowntimeState,
        props: {
          end,
          timeZone: "UTC",
          actions: createRawSnippet(() => ({ render: () => '<a href="/">Accueil</a>' })),
        },
      },
    });

    expect(getByRole("heading", { level: 2, name: "Momentanément indisponible" })).toBeTruthy();
    expect(text(getByRole("status"))).toMatch(
      "Cette page est indisponible pendant la maintenance. Fin prévue : 12 oct. 2026, 07:00 UTC."
    );
    expect(getByRole("link", { name: "Accueil" })).toBeTruthy();
  });
});
