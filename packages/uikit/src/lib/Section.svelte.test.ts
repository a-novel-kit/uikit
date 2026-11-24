import NestedSectionsFixture from "../../test/NestedSectionsFixture.svelte";
import Section from "./Section.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

const content = createRawSnippet(() => ({ render: () => "<p>Two devices.</p>" }));

describe("Section", () => {
  it("names its region after its heading, above its content", () => {
    const { getByRole } = render(Section, {
      title: "Devices",
      description: "The devices signed in to your account.",
      children: content,
    });
    const region = getByRole("region", { name: "Devices" });
    const heading = getByRole("heading", { level: 2, name: "Devices" });

    expect(region.textContent).toContain("The devices signed in to your account.");
    expect(heading.compareDocumentPosition(region.querySelector("p")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("steps its heading down for a section inside another, and stops at level 4", () => {
    const { getByRole } = render(NestedSectionsFixture);

    expect(getByRole("heading", { level: 2, name: "Credentials" })).toBeTruthy();
    expect(getByRole("heading", { level: 3, name: "Email and password" })).toBeTruthy();
    expect(getByRole("heading", { level: 4, name: "Recovery" })).toBeTruthy();
    expect(getByRole("heading", { level: 4, name: "Codes" })).toBeTruthy();
  });

  it("takes the level a caller gives it", () => {
    const { getByRole } = render(Section, { title: "Email and password", headingLevel: 3, children: content });

    expect(getByRole("region", { name: "Email and password" })).toBeTruthy();
    expect(getByRole("heading", { level: 3, name: "Email and password" })).toBeTruthy();
  });

  it("holds its controls beside the heading", () => {
    const actions = createRawSnippet(() => ({ render: () => '<button type="button">Log out of all</button>' }));
    const { getByRole } = render(Section, { title: "Devices", actions, children: content });

    expect(getByRole("region", { name: "Devices" }).contains(getByRole("button", { name: "Log out of all" }))).toBe(
      true
    );
  });
});
