/// <reference types="vite/client" />
import Tooltip from "./Tooltip.svelte";
import type { TooltipTriggerAttributes } from "./Tooltip.svelte";
import { createOpenController } from "./controllers.svelte";

import { createRawSnippet } from "svelte";

import { expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const trigger = createRawSnippet<[TooltipTriggerAttributes]>((attributes) => ({
  render: () => `<button style="margin: 10rem" aria-describedby="${attributes()["aria-describedby"]}">Help</button>`,
}));

it("anchors a tooltip its controller opens to the trigger it describes", async () => {
  const controller = createOpenController({ initialOpen: true });
  render(Tooltip, { content: "Open documentation", controller, trigger, side: "right" });
  const button = page.getByRole("button", { name: "Help" }).element().getBoundingClientRect();

  await expect
    .poll(() => page.getByRole("tooltip").element().getBoundingClientRect().left)
    .toBeGreaterThan(button.right);
  expect(page.getByRole("tooltip").element().getBoundingClientRect().top).toBeCloseTo(button.top);
  expect(controller.state.open).toBe(true);
});
