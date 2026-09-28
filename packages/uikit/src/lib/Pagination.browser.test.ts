/// <reference types="vite/client" />
import Pagination from "./Pagination.svelte";

import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

it.each(["button", "link"] as const)("keeps the current page's color while hovering its %s", async (role) => {
  const { getByRole } = render(Pagination, {
    currentPage: 2,
    totalPages: 3,
    getHref: role === "link" ? (page) => `#page-${page}` : undefined,
  });
  const current = getByRole(role, { name: "2" });
  await userEvent.unhover(current);
  const appearance = () => {
    const css = getComputedStyle(current);
    return { background: css.backgroundColor, color: css.color, border: css.borderColor, shadow: css.boxShadow };
  };
  const selected = appearance();
  await userEvent.hover(current);
  expect(current).toHaveAttribute("aria-current", "page");
  expect(appearance()).toEqual(selected);
});
