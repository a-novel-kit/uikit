import I18nFixture from "../../../test/I18nFixture.svelte";
import Pagination from "../Pagination.svelte";
import en from "../i18n/locales/en/uikit.json";
import fr from "../i18n/locales/fr/uikit.json";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

const props = { currentPage: 2, totalPages: 3, onPageChange: () => undefined };

describe("uikit messages", () => {
  it("speak English outside any provider", () => {
    const { getByRole } = render(Pagination, props);

    expect(getByRole("navigation", { name: "Pagination" })).toBeTruthy();
    expect(getByRole("button", { name: "Next" })).toBeTruthy();
  });

  it("follow the language of the app's provider", () => {
    const { getByRole } = render(I18nFixture, { props: { locale: "fr", component: Pagination, props } });

    expect(getByRole("button", { name: "Précédent" })).toBeTruthy();
    expect(getByRole("button", { name: "Suivant" })).toBeTruthy();
  });

  it("let the app's own uikit messages win", () => {
    const { getByRole } = render(I18nFixture, {
      props: {
        locale: "fr",
        component: Pagination,
        props,
        overrides: { pagination: { next: "Page suivante" } },
      },
    });

    expect(getByRole("button", { name: "Page suivante" })).toBeTruthy();
    // Messages the app leaves out still come from uikit.
    expect(getByRole("button", { name: "Précédent" })).toBeTruthy();
  });

  it("fall back to English in a language uikit doesn't ship", () => {
    const { getByRole } = render(I18nFixture, { props: { locale: "de", component: Pagination, props } });

    expect(getByRole("button", { name: "Next" })).toBeTruthy();
  });
});

// Flattens a catalog into its message keys and texts.
function messages(catalog: object, prefix = ""): Record<string, string> {
  return Object.fromEntries(
    Object.entries(catalog).flatMap(([key, value]) =>
      typeof value === "string" ? [[prefix + key, value]] : Object.entries(messages(value, `${prefix}${key}.`))
    )
  );
}

describe("uikit catalogs", () => {
  const english = messages(en);
  const french = messages(fr);

  it("translate every English message into French", () => {
    expect(Object.keys(french).sort()).toEqual(Object.keys(english).sort());
    expect(Object.entries(french).filter(([, text]) => text.trim() === "")).toEqual([]);
  });

  it("put no space before a colon in French", () => {
    expect(Object.entries(french).filter(([, text]) => /\s:/.test(text))).toEqual([]);
  });

  it("keep the same placeholders in every language", () => {
    const placeholders = (text: string) => [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map(([, name]) => name).sort();

    for (const [key, text] of Object.entries(english)) {
      expect(placeholders(french[key]), key).toEqual(placeholders(text));
    }
  });
});
