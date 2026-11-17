import { afterEach, beforeEach, expect } from "vitest";
import type { TestContext } from "vitest";
import { page } from "vitest/browser";

// Vitest resolves a flat name of word characters and single hyphens, so the name uses no others.
const screenshot = ({ task }: TestContext) => `${task.file.name}-${task.name}`.replace(/\W+/g, "-") + ".png";

// Vitest accepts annotations only while the test runs, so the screenshot is declared before it.
beforeEach(async (context) => {
  await context.annotate(screenshot(context), "visual-snapshot");
});

// The viewport, unlike the story's container, includes the dialogs and popovers of the top layer.
afterEach(async (context) => {
  await document.fonts.ready;
  await expect(page).toMatchScreenshot(screenshot(context));
});
