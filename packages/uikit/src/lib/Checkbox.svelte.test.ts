import Checkbox from "./Checkbox.svelte";
import { createCheckedController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

describe("Checkbox", () => {
  it("keeps its controller's choice through a form reset", async () => {
    const form = document.body.appendChild(document.createElement("form"));
    const controller = createCheckedController();
    const { getByRole } = render(Checkbox, {
      target: form,
      props: { label: "Remember me", name: "remember", controller },
    });

    await fireEvent.click(getByRole("checkbox", { name: "Remember me" }));
    form.reset();

    expect(new FormData(form).get("remember")).toBe("on");
    form.remove();
  });
});
