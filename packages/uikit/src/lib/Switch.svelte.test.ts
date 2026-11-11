import Switch from "./Switch.svelte";
import { createCheckedController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

describe("Switch", () => {
  it("keeps its controller's choice through a form reset", async () => {
    const form = document.body.appendChild(document.createElement("form"));
    const controller = createCheckedController();
    const { getByRole } = render(Switch, {
      target: form,
      props: { label: "Notifications", name: "notify", controller },
    });

    await fireEvent.click(getByRole("switch", { name: "Notifications" }));
    form.reset();

    expect(new FormData(form).get("notify")).toBe("on");
    form.remove();
  });
});
