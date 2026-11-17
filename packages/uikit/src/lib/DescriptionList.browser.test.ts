/// <reference types="vite/client" />
import Fixture from "../../test/DescriptionListFixture.svelte";

import { expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

// The screen stays wide, so only the space the list gets decides its columns.
it.each([
  ["side by side", "60rem", true],
  ["stacked", "30rem", false],
])("sets its two-column entries %s in a %s container on a wide screen", async (_, width, sideBySide) => {
  await page.viewport(1280, 800);
  const target = document.body.appendChild(document.createElement("div"));
  target.style.inlineSize = width;
  const { getByText } = render(Fixture, { target });

  const owner = getByText("Owner").getBoundingClientRect();
  const status = getByText("Status").getBoundingClientRect();
  expect(owner.top === status.top).toBe(sideBySide);
  target.remove();
});
