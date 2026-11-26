/// <reference types="vite/client" />
import ActionMenuTriggerFixture from "../../test/ActionMenuTriggerFixture.svelte";
import BlurredPageFixture from "../../test/BlurredPageFixture.svelte";
import { attachShadowRoot, importCopy } from "../../test/shadowRoot";
import Card from "./Card.svelte";
import ConsentBanner from "./ConsentBanner.svelte";
import Select from "./Select.svelte";
import Skeleton from "./Skeleton.svelte";
import TagInput from "./TagInput.svelte";
import Tooltip from "./Tooltip.svelte";
import type { TooltipTriggerAttributes } from "./Tooltip.svelte";
import {
  createConsentController,
  createOpenController,
  createSelectController,
  createTagInputController,
} from "./controllers.svelte";
import * as uikit from "./index";

import { createRawSnippet } from "svelte";

import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { fireEvent, render, within } from "@testing-library/svelte";

// A second copy of uikit, as an interface that embeds its own beside the page's runs.
const copy = await importCopy<typeof uikit>("../src/lib/index.ts");
const { default: CopiedBlurredPageFixture } = await importCopy<{ default: typeof BlurredPageFixture }>(
  "./BlurredPageFixture.svelte"
);

const rootStyle = () => getComputedStyle(document.documentElement);
const backdropBlur = (element: Element) => getComputedStyle(element).backdropFilter;
const children = createRawSnippet(() => ({ render: () => "<span>Reports help us fix failures.</span>" }));

/** Waits until the element, and what it holds, has finished every transition and animation it runs. */
const settled = (element: Element) =>
  Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished));

describe.each([
  { copy: "the page's copy", kit: uikit, Fixture: BlurredPageFixture },
  { copy: "another copy", kit: copy, Fixture: CopiedBlurredPageFixture },
])("A modal dialog in a shadow root, from $copy of uikit", ({ kit, Fixture }) => {
  /** Renders a frosted card and a skeleton in the page, then a frosted page under a dialog in a shadow root. */
  function renderUnderDialog() {
    render(Card, { "data-testid": "document-card", children });
    render(Skeleton, { "data-testid": "document-skeleton" });
    const shadow = attachShadowRoot();
    const controller = kit.createOpenController();
    render(Fixture, { target: shadow as unknown as HTMLElement, props: { controller } });
    const testId = (id: string) =>
      (document.querySelector(`[data-testid=${id}]`) ?? shadow.querySelector(`[data-testid=${id}]`))!;
    return { shadow, controller, testId, dialog: shadow.querySelector("dialog")! };
  }

  it("blurs and holds the page, drops every frost outside it once its backdrop has faded in, and gives them back", async () => {
    const { shadow, controller, testId, dialog } = renderUnderDialog();
    const frosted = [testId("document-card"), ...shadow.querySelectorAll("[data-frost]:not(dialog *)")];
    const adopted = [document.adoptedStyleSheets.length, shadow.adoptedStyleSheets.length];
    expect(frosted.map(backdropBlur)).not.toContain("none");

    controller.open();
    await expect.poll(() => dialog.matches(":modal")).toBe(true);
    // While the backdrop fades in, the page keeps its frost, so no card shows unfrosted.
    expect(frosted.map(backdropBlur)).not.toContain("none");
    expect(rootStyle().overflow).toBe("hidden");

    await expect.poll(() => frosted.map(backdropBlur)).toEqual(frosted.map(() => "none"));
    await expect.poll(() => rootStyle().filter).toBe("blur(8px)");
    expect(backdropBlur(testId("dialog-card"))).not.toBe("none");

    controller.close();
    await expect.poll(() => frosted.map(backdropBlur)).not.toContain("none");
    expect(rootStyle().overflow).not.toBe("hidden");
    await expect.poll(() => rootStyle().filter).toBe("none");

    // Once the dialog has faded out, neither the page nor the shadow root keeps its rules.
    await settled(dialog);
    expect([document.adoptedStyleSheets.length, shadow.adoptedStyleSheets.length]).toEqual(adopted);
  });

  // Each frame an animation draws on the page makes the root blur it again.
  it("pauses what animates outside it, in the page and in its own root, and never what it holds", async () => {
    const { controller, testId, dialog } = renderUnderDialog();
    const playState = (id: string) => getComputedStyle(testId(id)).animationPlayState;
    const outside = ["document-skeleton", "page-skeleton"];
    expect(outside.map(playState)).toEqual(["running", "running"]);

    controller.open();
    await expect.poll(() => dialog.matches(":modal")).toBe(true);
    expect(outside.map(playState)).toEqual(["paused", "paused"]);
    expect(playState("dialog-skeleton")).toBe("running");

    controller.close();
    await expect.poll(() => outside.map(playState)).toEqual(["running", "running"]);
  });
});

describe("A modal dialog in a shadow root", () => {
  /** Renders a dialog of `kit` in a new shadow root, and returns its root, controller and element. */
  function renderDialog(kit: typeof uikit, props: Partial<uikit.DialogProps> = {}) {
    const shadow = attachShadowRoot();
    const controller = kit.createOpenController();
    render(kit.Dialog, { target: shadow as unknown as HTMLElement, props: { controller, title: "Edit", ...props } });
    return { shadow, controller, dialog: shadow.querySelector("dialog")! };
  }

  it("holds a page it covers fullscreen without blurring it", async () => {
    const { controller, dialog } = renderDialog(uikit, { presentation: "fullscreen" });

    controller.open();
    await expect.poll(() => dialog.matches(":modal")).toBe(true);

    expect(rootStyle().overflow).toBe("hidden");
    await settled(dialog);
    expect(rootStyle().filter).toBe("none");
  });

  // The page may run another copy of uikit, or none.
  it("blurs the page by the tokens of its own root, whatever the page defines", async () => {
    const { shadow, controller, dialog } = renderDialog(uikit);
    (shadow.host as HTMLElement).style.setProperty("--blur-sm", "3px");

    controller.open();
    await expect.poll(() => dialog.matches(":modal")).toBe(true);

    await expect.poll(() => rootStyle().filter).toBe("blur(3px)");
  });

  it("keeps the page held until the last of two dialogs, from two copies of uikit, closes", async () => {
    const first = renderDialog(uikit);
    const second = renderDialog(copy);
    first.controller.open();
    second.controller.open();
    await expect.poll(() => rootStyle().filter).toBe("blur(8px)");

    first.controller.close();
    await expect.poll(() => first.dialog.open).toBe(false);
    await settled(first.dialog);
    expect(rootStyle().filter).toBe("blur(8px)");
    expect(rootStyle().overflow).toBe("hidden");

    second.controller.close();
    await expect.poll(() => rootStyle().filter).toBe("none");
    expect(rootStyle().overflow).not.toBe("hidden");
  });
});

// A modal dialog leaves the page inert, so the topmost one of a copy shows that copy's requests. Another copy keeps
// its requests in its own module state, where they stay.
describe("A request over a modal dialog in a shadow root", () => {
  /** Renders an unanswered consent request in the page and a dialog of `kit` in a shadow root, then opens it. */
  async function openOver(kit: typeof uikit) {
    const onChoice = vi.fn();
    render(ConsentBanner, {
      controller: createConsentController({ initialOpen: true, onChoice }),
      title: "Error reports",
      children,
    });
    const onPage = document.querySelector("section")!;
    const shadow = attachShadowRoot();
    const controller = kit.createOpenController();
    render(kit.Dialog, { target: shadow as unknown as HTMLElement, props: { controller, title: "Log in" } });
    const dialog = shadow.querySelector("dialog")!;
    controller.open();
    await expect.poll(() => dialog.matches(":modal")).toBe(true);
    return { onChoice, controller, shadow, dialog, onPage };
  }

  it("shows a request of its own copy from the page, and keeps it answerable", async () => {
    const { onChoice, dialog } = await openOver(uikit);
    await expect.poll(() => dialog.querySelector("section")).not.toBeNull();

    await userEvent.click(within(dialog.querySelector("section")!).getByRole("button", { name: "Accept" }));

    expect(onChoice).toHaveBeenCalledWith("accepted");
  });

  it("leaves a request of another copy in the page, under the dialog, until the dialog closes", async () => {
    const { onChoice, controller, shadow, dialog, onPage } = await openOver(copy);
    const accept = within(onPage).getByRole("button", { name: "Accept" });
    const { left, top, width, height } = accept.getBoundingClientRect();
    const reached = () => document.elementFromPoint(left + width / 2, top + height / 2);
    expect(dialog.querySelector("section")).toBeNull();
    expect(reached()).toBe(shadow.host);

    controller.close();
    await expect.poll(reached).toBe(accept);
    await userEvent.click(accept);

    expect(onChoice).toHaveBeenCalledWith("accepted");
  });
});

describe("Floating surfaces in a shadow root", () => {
  const options = Array.from({ length: 30 }, (_, index) => ({ value: `${index}`, label: `Option ${index + 1}` }));

  it.each([
    ["the page", () => undefined],
    ["a shadow root", attachShadowRoot],
  ])("scroll the active option of a list into view from the keyboard, in %s", async (_, attach) => {
    const target = attach() as HTMLElement | undefined;
    const { getByRole } = render(Select, {
      target,
      props: { controller: createSelectController<string>(), "aria-label": "Chapter", options },
    });
    const listbox = () => getByRole("listbox").getBoundingClientRect();
    const option = (name: string) => getByRole("option", { name }).getBoundingClientRect();
    getByRole("combobox").focus();

    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(() => option("Option 30").bottom).toBeLessThanOrEqual(listbox().bottom);

    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => option("Option 1").top).toBeGreaterThanOrEqual(listbox().top);
  });

  it("anchor a menu its controller opens to a composed trigger", async () => {
    const holder = attachShadowRoot().appendChild(document.createElement("div"));
    holder.style.padding = "12rem";
    const controller = createOpenController();
    const { getByRole } = render(ActionMenuTriggerFixture, { target: holder, props: { controller } });
    const trigger = getByRole("button", { name: "Item actions" }).getBoundingClientRect();

    controller.open();

    await expect.poll(() => getByRole("menu").getBoundingClientRect().top).toBeGreaterThanOrEqual(trigger.bottom);
    expect(getByRole("menu").getBoundingClientRect().right).toBeCloseTo(trigger.right);
  });

  it("anchor a tooltip its controller opens to the trigger it describes", async () => {
    const trigger = createRawSnippet<[TooltipTriggerAttributes]>((attributes) => ({
      render: () =>
        `<button style="margin: 10rem" aria-describedby="${attributes()["aria-describedby"]}">Help</button>`,
    }));
    const controller = createOpenController({ initialOpen: true });
    const { getByRole } = render(Tooltip, {
      target: attachShadowRoot() as unknown as HTMLElement,
      props: { content: "Open documentation", controller, trigger, side: "right" },
    });
    const button = getByRole("button", { name: "Help" }).getBoundingClientRect();

    await expect.poll(() => getByRole("tooltip").getBoundingClientRect().left).toBeGreaterThan(button.right);
    expect(getByRole("tooltip").getBoundingClientRect().top).toBeCloseTo(button.top);
  });

  it("follow a scroll inside the root where the browser leaves them away from their trigger", async () => {
    const shadow = attachShadowRoot();
    const layout = new CSSStyleSheet();
    layout.replaceSync(`
      [role="listbox"] { position-area: none !important; }
      .scroller { block-size: 20rem; overflow: auto; }
      .scroller > div { padding-block: 8rem 80rem; }
    `);
    shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, layout];
    const scroller = shadow.appendChild(document.createElement("div"));
    scroller.className = "scroller";
    const { getByRole } = render(Select, {
      target: scroller.appendChild(document.createElement("div")),
      props: { controller: createSelectController<string>(), "aria-label": "Chapter", options: options.slice(0, 2) },
    });
    const trigger = getByRole("combobox");
    await userEvent.click(trigger);
    const listbox = getByRole("listbox");
    const gap = () => Math.round(listbox.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom);
    await expect.poll(gap).toBe(2);

    scroller.scrollBy(0, 60);

    await expect.poll(gap).toBe(2);
  });
});

it("makes the word typed in a tag field of a shadow root a tag when its form resets", async () => {
  const form = attachShadowRoot().appendChild(document.createElement("form"));
  const controller = createTagInputController({ initialTags: ["maps"] });
  const { getByRole } = render(TagInput, { target: form, props: { "aria-label": "Tags", name: "tags", controller } });
  const input = getByRole("textbox", { name: "Tags" }) as HTMLInputElement;

  await fireEvent.input(input, { target: { value: "noir" } });
  form.reset();

  expect(controller.state.tags).toEqual(["maps", "noir"]);
  expect(input.value).toBe("");
});
