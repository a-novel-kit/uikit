import I18nFixture from "../../test/I18nFixture.svelte";
import ConsentBanner from "./ConsentBanner.svelte";
import { type ConsentController, createConsentController } from "./controllers.svelte";

import { createRawSnippet, flushSync } from "svelte";

import { describe, expect, it, vi } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

const children = createRawSnippet(() => ({ render: () => "<span>Your browser sends us error reports.</span>" }));

// Answers leave the state as it is, so a test sees what the component renders for a refused change.
function fixedConsent(open: boolean): ConsentController {
  return { state: { open }, open: vi.fn(), accept: vi.fn(), decline: vi.fn() };
}

describe("ConsentBanner", () => {
  it("names its region after the title and offers both answers", () => {
    const { getByRole } = render(ConsentBanner, { controller: fixedConsent(true), title: "Error reports", children });

    const region = getByRole("region", { name: "Error reports" });
    expect(region.textContent).toContain("Your browser sends us error reports.");
    expect(getByRole("button", { name: "Decline" })).toBeTruthy();
    expect(getByRole("button", { name: "Accept" })).toBeTruthy();
  });

  it.each([
    { answer: "Accept", choice: "accepted" },
    { answer: "Decline", choice: "declined" },
  ])("hides once the visitor picks $answer", async ({ answer, choice }) => {
    const onChoice = vi.fn();
    const controller = createConsentController({ initialOpen: true, onChoice });
    const { getByRole, queryByRole } = render(ConsentBanner, { controller, title: "Error reports", children });

    await fireEvent.click(getByRole("button", { name: answer }));

    expect(onChoice).toHaveBeenCalledWith(choice);
    expect(queryByRole("region")).toBeNull();
  });

  it("shows again when the visitor reopens it", () => {
    const controller = createConsentController();
    const { queryByRole } = render(ConsentBanner, { controller, title: "Error reports", children });
    expect(queryByRole("region")).toBeNull();

    controller.open();
    flushSync();

    expect(queryByRole("region", { name: "Error reports" })).not.toBeNull();
  });

  it("asks the controller instead of hiding by itself", async () => {
    const controller = fixedConsent(true);
    const { getByRole } = render(ConsentBanner, { controller, title: "Error reports", children });

    await fireEvent.click(getByRole("button", { name: "Accept" }));

    expect(controller.accept).toHaveBeenCalledOnce();
    expect(getByRole("region")).toBeTruthy();
  });

  it("speaks French in a French app", () => {
    const { getByRole } = render(I18nFixture, {
      props: {
        locale: "fr",
        component: ConsentBanner,
        props: { controller: fixedConsent(true), title: "Rapports d’erreurs", children },
      },
    });

    expect(getByRole("button", { name: "Refuser" })).toBeTruthy();
    expect(getByRole("button", { name: "Accepter" })).toBeTruthy();
  });
});
