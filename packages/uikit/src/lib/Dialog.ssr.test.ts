import Dialog from "./Dialog.svelte";
import { createOpenController } from "./controllers.svelte";

import { render } from "svelte/server";

import { describe, expect, it } from "vitest";

describe("Dialog SSR", () => {
  it.each([true, false])("renders controller visibility before hydration: %s", (initialOpen) => {
    const { body } = render(Dialog, {
      props: { title: "Account", controller: createOpenController({ initialOpen }) },
    });
    expect(/<dialog\s[^>]*\bopen(?:=|\s|>)/.test(body)).toBe(initialOpen);
    expect(body).toContain("Account");
  });
});
