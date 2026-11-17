import { playwright } from "@vitest/browser-playwright";

/** The headless Chromium that every browser project of the workspace runs in. */
export const chromium = {
  enabled: true,
  provider: playwright({}),
  headless: true,
  instances: [{ browser: "chromium" as const }],
};
