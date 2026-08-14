import DescriptionList from "./DescriptionList.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

describe("DescriptionList", () => {
  it("keeps native term and description semantics", () => {
    const children = createRawSnippet(() => ({
      render: () => "<div><dt>Owner</dt><dd>Ada Lovelace</dd></div><div><dt>Status</dt><dd>Ready</dd></div>",
    }));
    const { container, getByText } = render(DescriptionList, {
      props: { columns: 2, density: "compact", children },
    });
    const list = container.querySelector("dl");

    expect(list?.className).toContain("columns-2");
    expect(list?.className).toContain("compact");
    expect(getByText("Owner").tagName).toBe("DT");
    expect(getByText("Ada Lovelace").tagName).toBe("DD");
  });
});
