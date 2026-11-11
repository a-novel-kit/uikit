import I18nFixture from "../../test/I18nFixture.svelte";
import FileInput from "./FileInput.svelte";

import { describe, expect, it, onTestFinished, vi } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

describe("FileInput", () => {
  it("forwards native file constraints and invalid state", () => {
    const { getByLabelText } = render(FileInput, {
      props: {
        "aria-label": "Reference files",
        accept: ".pdf,.txt",
        multiple: true,
        invalid: true,
        controlSize: "lg",
      },
    });
    const input = getByLabelText("Reference files") as HTMLInputElement;

    expect(input.type).toBe("file");
    expect(input.accept).toBe(".pdf,.txt");
    expect(input.multiple).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.parentElement?.className).toContain("lg");
  });

  it("words its placeholder in the app's language, with no button of its own", () => {
    const props = { "aria-label": "Fichiers" };
    const { getByText, queryAllByRole } = render(I18nFixture, { props: { locale: "fr", component: FileInput, props } });

    expect(getByText("Aucun fichier choisi")).toBeTruthy();
    expect(queryAllByRole("button")).toHaveLength(0);
  });

  it.each([
    { value: ["chapter-one.pdf"], status: "chapter-one.pdf" },
    { value: ["chapter-one.pdf", "notes.txt"], status: "2 files" },
  ])("shows $status for the files its controller holds", ({ value, status }) => {
    const controller = { state: { value }, setValue: () => undefined };
    const { getByText } = render(FileInput, { props: { "aria-label": "Files", controller } });

    expect(getByText(status)).toBeTruthy();
  });

  it("shows a selection the browser restored before it mounted", () => {
    const restored = [new File(["text"], "restored.pdf")] as unknown as FileList;
    const files = vi.spyOn(HTMLInputElement.prototype, "files", "get").mockReturnValue(restored);
    onTestFinished(() => files.mockRestore());

    const { getByText } = render(FileInput, { props: { "aria-label": "Files" } });

    expect(getByText("restored.pdf")).toBeTruthy();
  });

  it("calls onclear from its cross, named after the chosen file, and offers none before a choice", async () => {
    const onclear = vi.fn();
    const chosen = { state: { value: ["logo.png"] }, setValue: () => undefined };
    const { getByRole } = render(FileInput, { props: { "aria-label": "Logo", onclear, controller: chosen } });
    const empty = render(FileInput, { props: { "aria-label": "Background", onclear } });

    await fireEvent.click(getByRole("button", { name: "Remove logo.png" }));

    expect(onclear).toHaveBeenCalledOnce();
    expect(empty.container.querySelector("button")).toBeNull();
  });
});
