import I18nFixture from "../../test/I18nFixture.svelte";
import AccessForbiddenState from "./AccessForbiddenState.svelte";
import AccessPendingState from "./AccessPendingState.svelte";
import AccessUnavailableState from "./AccessUnavailableState.svelte";
import PageErrorState from "./PageErrorState.svelte";
import PageNotFoundState from "./PageNotFoundState.svelte";
import ProtectedPage from "./ProtectedPage.svelte";
import { type AuthorizationStatus, createAuthorizationController } from "./authorization";
import en from "./i18n/locales/en/uikit.json";
import fr from "./i18n/locales/fr/uikit.json";

import { createRawSnippet, tick } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

const links = { homeHref: "/", retryHref: "/projects?sort=recent" };
const children = createRawSnippet(() => ({ render: () => "<p>Protected content</p>" }));
const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }));

describe("ProtectedPage", () => {
  it("shows nothing to a visitor without an account, whom the app sends to its sign-in", () => {
    const { container } = render(ProtectedPage, { ...links, controller: { state: { status: "anonymous" } }, children });

    expect(container.textContent).toBe("");
  });

  it("swaps the page for the state that stops it as the decision changes", async () => {
    let status: AuthorizationStatus = $state("allowed");
    const controller = createAuthorizationController({ getStatus: () => status });
    const { getByRole, queryByText } = render(ProtectedPage, { ...links, controller, children });
    expect(queryByText("Protected content")).not.toBeNull();

    status = "forbidden";
    await tick();

    expect(queryByText("Protected content")).toBeNull();
    expect(getByRole("heading", { level: 1, name: en.access.forbidden.title })).toBeTruthy();
  });
});

/** Each access and page state, the messages it shows, and the link it offers. */
const states = [
  { name: "AccessPendingState", component: AccessPendingState, key: "pending", link: undefined },
  { name: "AccessForbiddenState", component: AccessForbiddenState, key: "forbidden", link: "home" },
  { name: "AccessUnavailableState", component: AccessUnavailableState, key: "unavailable", link: "retry" },
  { name: "PageNotFoundState", component: PageNotFoundState, key: "notFound", link: "home" },
  { name: "PageErrorState", component: PageErrorState, key: "error", link: "home" },
] as const;

describe.each([
  { locale: "en", catalog: en },
  { locale: "fr", catalog: fr },
])("access and page states in $locale", ({ locale, catalog }) => {
  it.each(states)("$name shows uikit's copy and its link", ({ component, key, link }) => {
    const { getByRole, queryByRole, container } = render(I18nFixture, { props: { locale, component, props: links } });
    const messages = catalog.access[key];

    expect(getByRole("heading", { name: messages.title })).toBeTruthy();
    expect(container.querySelector("p")?.textContent).toBe(
      "description" in messages ? messages.description : undefined
    );
    if (link) expect(getByRole("link", { name: catalog.access[link] })).toBeTruthy();
    else expect(queryByRole("link")).toBeNull();
  });
});

describe("access and page states", () => {
  it.each(states)("$name takes a string or a snippet for each text, and actions for its link", ({ component }) => {
    const props = {
      ...links,
      title: snippet("<span>Project <em>locked</em></span>"),
      description: "Ask the project's owner.",
      actions: snippet('<a href="/help">Get help</a>'),
    };
    const { getByRole, getByText, getAllByRole } = render(I18nFixture, { props: { locale: "en", component, props } });

    expect(getByRole("heading", { name: "Project locked" })).toBeTruthy();
    expect(getByText("Ask the project's owner.")).toBeTruthy();
    expect(getAllByRole("link").map((link) => link.textContent)).toEqual(["Get help"]);
  });
});
