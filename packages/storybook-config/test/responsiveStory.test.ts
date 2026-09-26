import { prepareReviewDocument } from "../src/responsiveStory";

import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => document.body.replaceChildren());

describe("prepareReviewDocument", () => {
  it("clears autofocus and aligns a requested screen section", () => {
    const frame = document.createElement("iframe");
    document.body.append(frame);

    const reviewDocument = frame.contentDocument;
    const reviewWindow = frame.contentWindow;
    expect(reviewDocument).not.toBeNull();
    expect(reviewWindow).not.toBeNull();
    if (!reviewDocument || !reviewWindow) return;

    const requestAnimationFrame = vi.fn();
    Object.defineProperty(reviewWindow, "requestAnimationFrame", {
      configurable: true,
      value: requestAnimationFrame,
    });

    const closeButton = reviewDocument.createElement("button");
    const target = reviewDocument.createElement("section");
    target.id = "account-password";
    target.style.scrollMarginTop = "24px";
    target.getBoundingClientRect = () => new DOMRect(0, 1200, 300, 100);
    reviewWindow.scrollTo = vi.fn();
    reviewDocument.body.append(closeButton, target);
    closeButton.focus();

    prepareReviewDocument(frame, target.id);

    expect(reviewDocument.activeElement).not.toBe(closeButton);
    expect(reviewWindow.scrollTo).toHaveBeenCalledWith({ top: 1176, behavior: "instant" });
    expect(requestAnimationFrame).toHaveBeenCalledOnce();
  });

  it("aligns a screen section rendered after the iframe load event", async () => {
    const frame = document.createElement("iframe");
    document.body.append(frame);

    const reviewDocument = frame.contentDocument;
    const reviewWindow = frame.contentWindow;
    expect(reviewDocument).not.toBeNull();
    expect(reviewWindow).not.toBeNull();
    if (!reviewDocument || !reviewWindow) return;

    Object.defineProperty(reviewWindow, "requestAnimationFrame", {
      configurable: true,
      value: vi.fn(),
    });

    prepareReviewDocument(frame, "account-email");

    const target = reviewDocument.createElement("section");
    target.id = "account-email";
    reviewWindow.scrollTo = vi.fn();
    reviewDocument.body.append(target);

    await vi.waitFor(() => expect(reviewWindow.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" }));
  });
});
