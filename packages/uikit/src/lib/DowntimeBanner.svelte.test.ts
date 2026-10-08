import I18nFixture from "../../test/I18nFixture.svelte";
import DowntimeBanner from "./DowntimeBanner.svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

const start = new Date("2026-10-12T06:00:00Z");
const end = new Date("2026-10-12T07:00:00Z");

// Collapses template whitespace and the narrow spaces Intl puts in times.
function text(element: HTMLElement): string {
  return element.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

describe("DowntimeBanner", () => {
  it.each([
    {
      name: "announces a scheduled maintenance with its expected time frame",
      started: false,
      expected:
        /^Scheduled maintenance Some services may be unavailable\. Expected: Oct 12, 2026, 6:00 – 7:00 AM UTC\.$/,
    },
    {
      name: "warns of a maintenance in progress with its expected end",
      started: true,
      expected:
        /^Maintenance in progress Some services may be unavailable\. Expected to end: Oct 12, 2026, 7:00 AM UTC\.$/,
    },
  ])("$name", ({ started, expected }) => {
    const { getByRole, queryByRole } = render(DowntimeBanner, {
      start,
      end,
      started,
      timeZone: "UTC",
    });

    expect(text(getByRole("status"))).toMatch(expected);
    // The banner can't be dismissed.
    expect(queryByRole("button")).toBeNull();
  });

  it("spans days in the time frame", () => {
    const { getByRole } = render(DowntimeBanner, {
      start,
      end: new Date("2026-10-13T09:30:00Z"),
      timeZone: "UTC",
    });

    expect(text(getByRole("status"))).toMatch("Expected: Oct 12, 2026, 6:00 AM UTC – Oct 13, 2026, 9:30 AM UTC.");
  });

  it("keeps each time on one line with its date and zone", () => {
    const { getByRole } = render(DowntimeBanner, { start, end, started: true, timeZone: "UTC" });

    expect(getByRole("status").textContent).toContain("Oct 12, 2026, 7:00 AM UTC".replaceAll(" ", "\u00a0"));
  });

  it("formats the time frame in the given time zone", () => {
    const { getByRole } = render(DowntimeBanner, { start, end, timeZone: "America/New_York" });

    expect(text(getByRole("status"))).toMatch("Expected: Oct 12, 2026, 2:00 – 3:00 AM EDT.");
  });

  it.each([
    {
      name: "speaks French in a French app, before the start",
      started: false,
      expected:
        "Maintenance programmée Certains services peuvent être indisponibles. Période prévue: 12 oct. 2026, 06:00 – 07:00 UTC.",
    },
    {
      name: "speaks French in a French app, once started",
      started: true,
      expected:
        "Maintenance en cours Certains services peuvent être indisponibles. Fin prévue: 12 oct. 2026, 07:00 UTC.",
    },
  ])("$name", ({ started, expected }) => {
    const { getByRole } = render(I18nFixture, {
      props: {
        locale: "fr",
        component: DowntimeBanner,
        props: { start, end, started, timeZone: "UTC" },
      },
    });

    expect(text(getByRole("status"))).toBe(expected);
  });
});
