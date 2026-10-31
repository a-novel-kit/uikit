import PasswordInput from "./PasswordInput.svelte";
import { createPressedController } from "./controllers.svelte";

import { afterEach, describe, expect, it } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

describe("PasswordInput", () => {
  afterEach(() => document.body.replaceChildren());

  it("shows and hides the value through a pressed toggle", async () => {
    const { getByLabelText, getByRole } = render(PasswordInput, {
      props: { controller: createPressedController(), "aria-label": "Password" },
    });
    const input = getByLabelText("Password");
    const toggle = getByRole("button", { name: "Show password" });

    expect(input.getAttribute("type")).toBe("password");
    expect(input.getAttribute("spellcheck")).toBe("false");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");

    await fireEvent.click(toggle);
    expect(input.getAttribute("type")).toBe("text");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");

    await fireEvent.click(toggle);
    expect(input.getAttribute("type")).toBe("password");
  });

  it("hides the value when its form submits", async () => {
    const form = document.body.appendChild(document.createElement("form"));
    form.addEventListener("submit", (event) => event.preventDefault());
    const { getByLabelText } = render(PasswordInput, {
      target: form,
      props: { controller: createPressedController({ initialPressed: true }), "aria-label": "Password" },
    });
    const input = getByLabelText("Password");

    expect(input.getAttribute("type")).toBe("text");
    await fireEvent.submit(form);
    expect(input.getAttribute("type")).toBe("password");
  });

  it("disables the toggle with the input", () => {
    const { getByRole } = render(PasswordInput, {
      props: { controller: createPressedController(), "aria-label": "Password", disabled: true },
    });

    expect(getByRole("button", { name: "Show password" }).hasAttribute("disabled")).toBe(true);
  });
});
