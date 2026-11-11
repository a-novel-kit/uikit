/// <reference types="vite/client" />
import FileInput from "./FileInput.svelte";

import { describe, expect, it, onTestFinished } from "vitest";
import { page, userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const chapter = new File(["text"], "chapter-one.pdf");
const notes = new File(["text"], "notes.txt");

/** Renders a file input inside a form and returns the form with the input's locator. */
function inForm(props: Record<string, unknown> = {}) {
  const form = document.body.appendChild(document.createElement("form"));
  onTestFinished(() => form.remove());
  render(FileInput, { target: form, props: { "aria-label": "Files", ...props } });
  return { form, input: page.getByLabelText("Files") };
}

describe("FileInput", () => {
  it("keeps the browser's control over its whole surface", () => {
    const { input } = inForm();
    const control = input.element().getBoundingClientRect();
    const surface = input.element().parentElement!.getBoundingClientRect();

    expect(control.width).toBeCloseTo(surface.width - 2, 0);
    expect(control.height).toBeCloseTo(surface.height - 2, 0);
  });

  it("opens the picker from its folder icon, and removes the choice from its cross", () => {
    const { input } = inForm({ onclear: () => undefined });
    const control = input.element();
    const surface = control.parentElement!;
    const centerOf = (element: Element) => {
      const box = element.getBoundingClientRect();
      return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    };
    const cross = page.getByRole("button", { name: "Remove the file" }).element();

    expect(centerOf(surface.querySelector(".browse")!)).toBe(control);
    expect(cross.contains(centerOf(cross))).toBe(true);
  });

  it("shows the name of the chosen file", async () => {
    const { input } = inForm();

    await userEvent.upload(input, chapter);

    await expect.element(page.getByText("chapter-one.pdf")).toBeVisible();
    await expect.element(page.getByText("No file chosen")).not.toBeInTheDocument();
  });

  it("counts several chosen files", async () => {
    const { input } = inForm({ multiple: true });

    await userEvent.upload(input, [chapter, notes]);

    await expect.element(page.getByText("2 files")).toBeVisible();
  });

  it("calls the app's handler and follows it when it empties the field", async () => {
    const onchange = (event: Event & { currentTarget: HTMLInputElement }) => {
      expect(event.currentTarget.files?.[0]?.name).toBe("chapter-one.pdf");
      event.currentTarget.value = "";
    };
    const { input } = inForm({ onchange });

    await userEvent.upload(input, chapter);

    await expect.element(page.getByText("No file chosen")).toBeVisible();
  });

  it("returns to the placeholder when its form resets", async () => {
    const { form, input } = inForm();
    await userEvent.upload(input, chapter);
    await expect.element(page.getByText("chapter-one.pdf")).toBeVisible();

    form.reset();

    await expect.element(page.getByText("No file chosen")).toBeVisible();
  });

  it("keeps the file name when a form reset is cancelled", async () => {
    const { form, input } = inForm();
    await userEvent.upload(input, chapter);
    await expect.element(page.getByText("chapter-one.pdf")).toBeVisible();

    form.addEventListener("reset", (event) => event.preventDefault());
    form.reset();
    // The input rereads its selection on a timer set during the reset, so this one follows it.
    await new Promise((resolve) => setTimeout(resolve));

    await expect.element(page.getByText("chapter-one.pdf")).toBeVisible();
  });
});
