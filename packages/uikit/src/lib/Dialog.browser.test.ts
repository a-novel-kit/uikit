import Dialog from "./Dialog.svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { render } from "@testing-library/svelte";

describe("Dialog browser lifecycle", () => {
  it("survives a queued native close after teardown", async () => {
    const view = render(Dialog, {
      props: { open: true, title: "Queued close" },
    });
    const dialog = page.getByRole("dialog").element() as HTMLDialogElement;

    await expect.element(page.getByRole("dialog")).toBeVisible();

    dialog.close("teardown");
    view.unmount();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(dialog.open).toBe(false);
    expect(dialog.returnValue).toBe("teardown");
  });
});
