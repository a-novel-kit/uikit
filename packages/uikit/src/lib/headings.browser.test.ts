/// <reference types="vite/client" />
import PageHeader from "./PageHeader.svelte";
import StatusState from "./StatusState.svelte";

import { expect, it } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

it.each(["page", "status"])("keeps wrapped %s headings legible and supporting text grouped", async (kind) => {
  await page.viewport(320, 800);
  const description = "Your original files are still on this device and can be uploaded again.";
  const props = {
    title: "Your reference files could not be uploaded to the workspace",
    description,
  };
  const { getByRole, getByText, rerender } = kind === "page" ? render(PageHeader, props) : render(StatusState, props);
  const heading = getByRole("heading");
  const style = getComputedStyle(heading);
  const lineHeight = parseFloat(style.lineHeight);
  expect(lineHeight / parseFloat(style.fontSize)).toBeCloseTo(1.25);
  expect(heading.getBoundingClientRect().height / lineHeight).toBeGreaterThan(1.9);
  expect(getByText(description).getBoundingClientRect().top - heading.getBoundingClientRect().bottom).toBe(8);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);

  await rerender({ description: undefined });
  expect(heading.parentElement!.getBoundingClientRect().height).toBe(heading.getBoundingClientRect().height);
});
