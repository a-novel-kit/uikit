import TagInput from "./TagInput.svelte";
import { createTagInputController } from "./controllers.svelte";
import { kebabTag, splitTags } from "./tags";

import { describe, expect, it } from "vitest";

import { fireEvent, render } from "@testing-library/svelte";

function renderTags(initialTags: string[] = []) {
  const controller = createTagInputController({ initialTags });
  const view = render(TagInput, { props: { "aria-label": "Tags", name: "tags", controller } });
  const input = view.getByRole("textbox", { name: "Tags" }) as HTMLInputElement;
  const sent = () =>
    Array.from(view.container.querySelectorAll<HTMLInputElement>('input[type="hidden"]'), (tag) => tag.value);
  return { ...view, controller, input, sent };
}

describe("TagInput", () => {
  it("ends a tag at a space or a comma, and keeps what follows as typed", async () => {
    const { input, sent } = renderTags();

    await fireEvent.input(input, { target: { value: "Slow Burn, maps tw" } });

    expect(sent()).toEqual(["slow", "burn", "maps"]);
    expect(input.value).toBe("tw");
  });

  it("ends a tag at the Arabic, ideographic and full-width commas too", async () => {
    const { input, sent } = renderTags();

    await fireEvent.input(input, { target: { value: "科幻，奇幻、ラーメン،noir " } });

    expect(sent()).toEqual(["科幻", "奇幻", "ラーメン", "noir"]);
  });

  it("ends the tags typed at Enter, as a separator does, and lets an empty field's Enter through", async () => {
    const { input, sent } = renderTags();

    input.value = "Années 50";
    expect(await fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
    expect(sent()).toEqual(["années", "50"]);

    expect(await fireEvent.keyDown(input, { key: "Enter" })).toBe(true);
  });

  it("takes the last tag back as text on Backspace in the empty field", async () => {
    const { input, sent } = renderTags(["maps", "slow-burn"]);

    await fireEvent.keyDown(input, { key: "Backspace" });

    expect(sent()).toEqual(["maps"]);
    expect(input.value).toBe("slow-burn");
  });

  it("leaves the typed word in the field when it loses focus, for the form to send after the tags", async () => {
    const form = document.body.appendChild(document.createElement("form"));
    const controller = createTagInputController({ initialTags: ["maps"] });
    const { getByRole } = render(TagInput, { target: form, props: { "aria-label": "Tags", name: "tags", controller } });
    const input = getByRole("textbox", { name: "Tags" }) as HTMLInputElement;

    input.value = "noir";
    await fireEvent.blur(input);

    expect(controller.state.tags).toEqual(["maps"]);
    expect(new FormData(form).getAll("tags")).toEqual(["maps", "noir"]);
    form.remove();
  });

  it("sends what a server reads as the very tags the field holds", async () => {
    const form = document.body.appendChild(document.createElement("form"));
    const controller = createTagInputController({ initialTags: ["maps"] });
    const { getByRole } = render(TagInput, { target: form, props: { "aria-label": "Tags", name: "tags", controller } });
    const input = getByRole("textbox", { name: "Tags" }) as HTMLInputElement;

    // A capital whose mark has no precomposed form, then its lowercase, then a repeat: one tag each time.
    await fireEvent.input(input, { target: { value: ["T\u0308", "\u1e97", "Maps", "noir "].join(" ") } });
    const read = [
      ...new Set(
        new FormData(form)
          .getAll("tags")
          .flatMap((entry) => splitTags(String(entry)))
          .map(kebabTag)
          .filter(Boolean)
      ),
    ];

    expect(read).toEqual(controller.state.tags);
    expect(controller.state.tags).toEqual(["maps", "\u1e97", "noir"]);
    form.remove();
  });

  it("keeps only the words its controller refuses when Enter ends the field", async () => {
    const controller = createTagInputController();
    const blocking = {
      get state() {
        return controller.state;
      },
      add: (text: string) => text !== "nsfw" && controller.add(text),
      remove: controller.remove,
    };
    const { getByRole } = render(TagInput, { props: { "aria-label": "Tags", name: "tags", controller: blocking } });
    const input = getByRole("textbox", { name: "Tags" }) as HTMLInputElement;

    input.value = "nsfw horror";
    await fireEvent.keyDown(input, { key: "Enter" });

    expect(controller.state.tags).toEqual(["horror"]);
    expect(input.value).toBe("nsfw");
  });

  it("tells assistive technology how many tags it holds", async () => {
    const { getByRole, input } = renderTags(["maps"]);
    const status = getByRole("status");
    expect(status.textContent).toBe("1 tag");

    await fireEvent.input(input, { target: { value: "noir " } });
    expect(status.textContent).toBe("2 tags");

    await fireEvent.keyDown(input, { key: "Backspace" });
    expect(status.textContent).toBe("1 tag");

    input.value = "";
    await fireEvent.keyDown(input, { key: "Backspace" });
    expect(status.textContent).toBe("No tags");
  });

  it("describes the field with its tag count, after Field's own description", () => {
    const controller = createTagInputController({ initialTags: ["maps", "noir", "western"] });
    const { getByRole } = render(TagInput, {
      props: { "aria-label": "Tags", "aria-describedby": "tags-hint", controller },
    });

    const input = getByRole("textbox", { name: "Tags" });
    const [hint, status] = input.getAttribute("aria-describedby")!.split(" ");
    expect(hint).toBe("tags-hint");
    expect(document.getElementById(status)?.textContent).toBe("3 tags");
  });

  it("keeps the focus on a cross whose removal its controller refuses", async () => {
    const controller = { state: { tags: ["maps"] }, add: () => true, remove: () => {} };
    const { getByRole } = render(TagInput, { props: { "aria-label": "Tags", controller } });
    const cross = getByRole("button", { name: "Remove maps" });
    cross.focus();

    await fireEvent.click(cross);

    expect(document.activeElement).toBe(cross);
  });

  it("removes a tag with its cross and gives the focus back to the field", async () => {
    const { getByRole, input, sent } = renderTags(["maps", "slow-burn"]);

    await fireEvent.click(getByRole("button", { name: "Remove maps" }));

    expect(sent()).toEqual(["slow-burn"]);
    expect(document.activeElement).toBe(input);
  });

  it("asks for a tag while required and empty, and is satisfied once it holds one", () => {
    const empty = createTagInputController();
    const filled = createTagInputController({ initialTags: ["maps"] });
    const { getAllByRole } = render(TagInput, { props: { "aria-label": "Tags", controller: empty, required: true } });
    render(TagInput, { props: { "aria-label": "Tags", controller: filled, required: true } });

    const [asking, satisfied] = getAllByRole("textbox", { name: "Tags" }) as HTMLInputElement[];
    expect(asking.checkValidity()).toBe(false);
    expect(satisfied.checkValidity()).toBe(true);
  });

  it("keeps its tags from Backspace while readonly, and sends none while disabled", async () => {
    const form = document.body.appendChild(document.createElement("form"));
    const readonly = createTagInputController({ initialTags: ["maps", "slow-burn"] });
    const disabled = createTagInputController({ initialTags: ["maps"] });
    const { getByRole } = render(TagInput, {
      target: form,
      props: { "aria-label": "Readonly", name: "kept", controller: readonly, readonly: true },
    });
    render(TagInput, {
      target: form,
      props: { "aria-label": "Off", name: "off", controller: disabled, disabled: true },
    });

    await fireEvent.keyDown(getByRole("textbox", { name: "Readonly" }), { key: "Backspace" });

    expect(readonly.state.tags).toEqual(["maps", "slow-burn"]);
    expect(new FormData(form).getAll("off")).toEqual([]);
    form.remove();
  });

  it("keeps typed text that its controller refuses, and a tag it does not remove", async () => {
    const controller = { state: { tags: ["maps", "noir"] }, add: () => false, remove: () => {} };
    const { getByRole } = render(TagInput, { props: { "aria-label": "Tags", name: "tags", controller } });
    const input = getByRole("textbox", { name: "Tags" }) as HTMLInputElement;

    await fireEvent.input(input, { target: { value: "western horr" } });
    expect(input.value).toBe("western horr");

    input.value = "horror";
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("horror");

    input.value = "";
    await fireEvent.keyDown(input, { key: "Backspace" });
    expect(input.value).toBe("");
  });

  it("ends tags only once input method text is composed", async () => {
    const { input, sent } = renderTags();

    await fireEvent.input(input, { target: { value: "ni hao" }, isComposing: true });
    expect(sent()).toEqual([]);
    input.value = "nihao";
    expect(await fireEvent.keyDown(input, { key: "Enter", keyCode: 229 })).toBe(true);
    expect(sent()).toEqual([]);

    input.value = "ni hao";
    await fireEvent.compositionEnd(input);
    expect(sent()).toEqual(["ni"]);
    expect(input.value).toBe("hao");
  });

  it("takes the last tag back on a Backspace an Android keyboard sends as key code 229", async () => {
    const { input, sent } = renderTags(["maps", "slow-burn"]);

    await fireEvent.keyDown(input, { key: "Backspace", keyCode: 229 });

    expect(sent()).toEqual(["maps"]);
    expect(input.value).toBe("slow-burn");
  });

  it("sends its tags to the form it names, and stays required for assistive technology once filled", () => {
    const other = document.body.appendChild(document.createElement("form"));
    other.id = "other";
    const controller = createTagInputController({ initialTags: ["maps", "slow-burn"] });
    const { getByRole } = render(TagInput, {
      props: { "aria-label": "Tags", name: "tags", form: "other", controller, required: true },
    });

    expect(new FormData(other).getAll("tags")).toEqual(["maps", "slow-burn", ""]);
    expect(getByRole("textbox", { name: "Tags" }).getAttribute("aria-required")).toBe("true");
    other.remove();
  });

  it("offers no cross while disabled", () => {
    const controller = createTagInputController({ initialTags: ["maps"] });
    const { queryByRole } = render(TagInput, { props: { "aria-label": "Tags", controller, disabled: true } });

    expect(queryByRole("button")).toBeNull();
  });
});
