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
    target.scrollIntoView = vi.fn();
    reviewDocument.body.append(closeButton, target);
    closeButton.focus();

    prepareReviewDocument(frame, target.id);

    expect(reviewDocument.activeElement).not.toBe(closeButton);
    expect(target.scrollIntoView).toHaveBeenCalledWith({ block: "start", inline: "nearest" });
    expect(requestAnimationFrame).toHaveBeenCalledOnce();
  });
});
