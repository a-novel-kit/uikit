import "../preview.css";
import { prepareReviewDocument } from "../src/responsiveStory";

import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

afterEach(() => {
  document.body.replaceChildren();
  window.scrollTo(0, 0);
});

async function reviewFrame(width: number) {
  document.body.innerHTML = `
      <div class="agora-story-review__viewport" style="width: ${width * 0.85}px; height: 340px">
        <div class="agora-story-review__document" style="width: ${width}px; height: 400px; transform: scale(.85)">
          <iframe class="agora-story-review__iframe" title="Scrollable preview"></iframe>
        </div>
      </div>`;

  const frame = document.querySelector("iframe");
  if (!frame) throw new Error("Review iframe is missing");
  await new Promise<void>((resolve) => {
    frame.addEventListener("load", () => resolve(), { once: true });
    frame.srcdoc = `<!doctype html><html><body style="margin: 0; font: 16px/24px sans-serif">
        <p style="margin: 0; height: 1600px">Selectable preview text</p>
        <p id="end" style="margin: 0; height: 400px; scroll-margin-top: 24px">End of preview</p>
      </body></html>`;
  });
  return frame;
}

describe("review frames", () => {
  it.each([1280, 390])("allows text selection and scrolling inside a scaled %ipx preview", async (width) => {
    const frame = await reviewFrame(width);
    await userEvent.dblClick(frame, { position: { x: 25, y: 10 } });
    expect(frame.contentWindow?.getSelection()?.toString()).toBe("Selectable");

    await userEvent.wheel(frame, { delta: { y: 400 } });
    await expect.poll(() => frame.contentWindow?.scrollY).toBeGreaterThan(0);
    expect(window.scrollY).toBe(0);

    await userEvent.keyboard("{Control>}{Home}{/Control}");
    await expect.poll(() => frame.contentWindow?.scrollY).toBe(0);
  });

  it("aligns an off-screen preview section without scrolling the documentation page", async () => {
    const frame = await reviewFrame(390);
    const spacer = document.createElement("div");
    spacer.style.height = "1200px";
    document.body.prepend(spacer);

    prepareReviewDocument(frame, "end");

    await expect.poll(() => frame.contentWindow?.scrollY).toBe(1576);
    expect(window.scrollY).toBe(0);
  });
});
