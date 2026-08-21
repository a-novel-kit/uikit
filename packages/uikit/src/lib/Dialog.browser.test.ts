import Dialog from "./Dialog.svelte";
import { createOpenController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { render } from "@testing-library/svelte";

describe("Dialog browser lifecycle", () => {
  it("survives a queued native close after teardown", async () => {
    const view = render(Dialog, {
      props: { controller: createOpenController({ initialOpen: true }), title: "Queued close" },
    });
    const dialog = page.getByRole("dialog").element() as HTMLDialogElement;

    await expect.element(page.getByRole("dialog")).toBeVisible();

    dialog.close("teardown");
    view.unmount();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(dialog.open).toBe(false);
    expect(dialog.returnValue).toBe("teardown");
  });

  it("keeps visibility fixed when its controller rejects a close request", async () => {
    const controller = {
      state: { open: true },
      open() {},
      close() {},
      toggle() {},
    };
    render(Dialog, { props: { controller, title: "Pinned dialog" } });
    const dialog = page.getByRole("dialog").element() as HTMLDialogElement;

    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(controller.state.open).toBe(true);
  });
});
