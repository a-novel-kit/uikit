/// <reference types="vite/client" />
import Table from "./Table.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const rows = "<tbody><tr><th scope='row'>Owner</th><td>Ada Lovelace</td></tr></tbody>";

describe("Table", () => {
  it("styles its own cells and leaves other tables on the page untouched", async () => {
    const other = document.createElement("table");
    other.innerHTML = rows;
    document.body.append(other);
    try {
      const { getByRole } = render(Table, {
        caption: "Project",
        children: createRawSnippet(() => ({ render: () => rows })),
      });
      const own = getByRole("table", { name: "Project" });
      for (const cell of own.querySelectorAll("th, td")) {
        expect(getComputedStyle(cell).verticalAlign).toBe("top");
        expect(getComputedStyle(cell).borderBottomStyle).toBe("solid");
      }
      for (const cell of other.querySelectorAll("th, td")) {
        expect(getComputedStyle(cell).verticalAlign).toBe("middle");
        expect(getComputedStyle(cell).borderBottomStyle).toBe("none");
      }

      const ownRow = own.querySelector("tr")!;
      const ownResting = getComputedStyle(ownRow).backgroundColor;
      await userEvent.hover(ownRow);
      expect(getComputedStyle(ownRow).backgroundColor).not.toBe(ownResting);

      const otherRow = other.querySelector("tr")!;
      const otherResting = getComputedStyle(otherRow).backgroundColor;
      await userEvent.hover(otherRow);
      expect(getComputedStyle(otherRow).backgroundColor).toBe(otherResting);
    } finally {
      other.remove();
    }
  });
});
