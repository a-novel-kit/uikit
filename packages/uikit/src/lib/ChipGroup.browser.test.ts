/// <reference types="vite/client" />
import Badge from "./Badge.svelte";
import ChipGroup from "./ChipGroup.svelte";
import { createChipGroupController } from "./controllers.svelte";

import { createRawSnippet } from "svelte";

import { describe, expect, it, onTestFinished } from "vitest";
import { page } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

function resolveColor(value: string) {
  const sample = document.body.appendChild(document.createElement("span"));
  sample.style.backgroundColor = value;
  const color = getComputedStyle(sample).backgroundColor;
  sample.remove();
  return color;
}

describe("ChipGroup", () => {
  it("keeps a medium field's height while its chips fit one row", () => {
    const options = [{ value: "fantasy", label: "Fantasy" }];
    const { container } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options } });
    const probe = document.body.appendChild(document.createElement("div"));
    probe.style.blockSize = "var(--control-height-md)";
    const height = probe.getBoundingClientRect().height;
    probe.remove();

    expect(container.querySelector(".chips")!.getBoundingClientRect().height).toBeCloseTo(height, 0);
  });

  it("reaches past a short chip's edges to the 24px minimum target", () => {
    const options = [{ value: "a", label: "A" }];
    const { container } = render(ChipGroup, { props: { legend: "Letters", name: "letters", options } });

    // Layout rounds the chip's fractional height, which leaves the target at 23.98px, so it is read to the whole pixel.
    const target = container.querySelector(".chip input")!.getBoundingClientRect();
    expect(Math.round(target.height)).toBeGreaterThanOrEqual(24);
    expect(Math.round(target.width)).toBeGreaterThanOrEqual(24);
  });

  it("keeps two narrow chips' targets apart", () => {
    const options = [
      { value: "i", label: "I" },
      { value: "l", label: "l" },
    ];
    const { container } = render(ChipGroup, { props: { legend: "Letters", name: "letters", options } });

    const [first, second] = Array.from(container.querySelectorAll(".chip input"), (input) =>
      input.getBoundingClientRect()
    );
    expect(first.right).toBeLessThanOrEqual(second.left);
  });

  it("dims a chosen option that is disabled", () => {
    const options = [{ value: "western", label: "Western", disabled: true }];
    const controller = createChipGroupController({ initialValue: ["western"] });
    const { container } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller } });

    const chip = container.querySelector(".chip")!;
    expect(Number(getComputedStyle(chip).opacity)).toBeLessThan(1);
  });

  it.each(["brand", "accent"] as const)("fills a chosen %s chip as the badge of the same tone", (tone) => {
    const options = [{ value: "fantasy", label: "Fantasy" }];
    const controller = createChipGroupController({ initialValue: ["fantasy"] });
    const { container } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, controller, tone } });
    const { getByText } = render(Badge, {
      tone,
      children: createRawSnippet(() => ({ render: () => "<span>Badge</span>" })),
    });

    const chip = getComputedStyle(container.querySelector(".chip")!).backgroundColor;
    expect(chip).toBe(getComputedStyle(getByText("Badge").parentElement!).backgroundColor);
  });

  it("keeps its error surface while disabled", () => {
    const options = [{ value: "fantasy", label: "Fantasy" }];
    const { container } = render(ChipGroup, {
      props: { legend: "Genres", name: "genres", options, disabled: true, error: "Too many." },
    });

    const well = container.querySelector(".chips")!;
    expect(getComputedStyle(well).backgroundColor).toBe(resolveColor("var(--color-control-surface-invalid)"));
  });

  it("scrolls a long searchable list under its search, within an open select's height", async () => {
    await page.viewport(1280, 800);
    onTestFinished(() => page.viewport(414, 896));
    const options = Array.from({ length: 400 }, (_, index) => ({ value: `genre-${index}`, label: `Genre ${index}` }));
    const { container } = render(ChipGroup, {
      props: { legend: "Genres", name: "genres", searchLabel: "Search genres", options },
    });
    const probe = document.body.appendChild(document.createElement("div"));
    probe.style.blockSize = "var(--control-menu-max-height)";
    const cap = probe.getBoundingClientRect().height;
    probe.remove();
    const list = container.querySelector<HTMLElement>(".options")!;
    const search = container.querySelector(".search")!;
    const top = search.getBoundingClientRect().top;

    list.scrollTop = list.scrollHeight;

    expect(list.getBoundingClientRect().height).toBeCloseTo(cap, 0);
    expect(list.scrollTop).toBeGreaterThan(0);
    expect(search.getBoundingClientRect().top).toBe(top);
  });

  it("pins a section's title flush under the search, covering the chips that pass under it", async () => {
    await page.viewport(1280, 800);
    onTestFinished(() => page.viewport(414, 896));
    const options = Array.from({ length: 150 }, (_, index) => ({
      value: `genre-${index}`,
      label: `Genre ${index}`,
      section: index < 100 ? "First" : "Second",
    }));
    const { container, getByText } = render(ChipGroup, {
      props: { legend: "Genres", name: "genres", searchLabel: "Search genres", options },
    });
    const list = container.querySelector<HTMLElement>(".options")!;

    list.scrollTop = 200;

    const title = getByText("First");
    expect(title.getBoundingClientRect().top).toBeCloseTo(list.getBoundingClientRect().top, 0);
    expect(getComputedStyle(title).backgroundImage).toContain("gradient");
  });

  it("opens the search and the chips over the whole screen on a narrow screen, and keeps the choice in the form", async () => {
    const form = document.body.appendChild(document.createElement("form"));
    onTestFinished(() => form.remove());
    const options = [
      { value: "cyberpunk", label: "Cyberpunk", section: "Science fiction" },
      { value: "farce", label: "Farce", section: "Comedy" },
    ];
    const controller = createChipGroupController({ initialValue: ["farce"] });
    render(ChipGroup, {
      target: form,
      props: { legend: "Genres", name: "genres", searchLabel: "Search genres", options, controller },
    });

    const trigger = page.getByRole("button", { name: "Farce" });
    await expect.element(trigger).toBeVisible();
    expect(trigger.element().textContent).not.toContain("Search genres");
    await trigger.click();
    const sheet = page.getByRole("dialog", { name: "Genres" });
    await expect.element(sheet.getByRole("searchbox", { name: "Search genres" })).toBeVisible();
    await sheet.getByRole("checkbox", { name: "Cyberpunk" }).click();
    await sheet.getByRole("button", { name: "Done" }).click();

    await expect.element(sheet).not.toBeInTheDocument();
    expect(new FormData(form).getAll("genres")).toEqual(["cyberpunk", "farce"]);
  });

  it("closes the chips' screen when the screen widens past it", async () => {
    const options = [{ value: "farce", label: "Farce" }];
    const controller = createChipGroupController();
    render(ChipGroup, {
      props: { legend: "Genres", name: "genres", searchLabel: "Search genres", options, controller },
    });
    await page.getByRole("button", { name: "Choose" }).click();
    controller.setQuery("far");

    await page.viewport(844, 390);
    onTestFinished(() => page.viewport(414, 896));

    await expect.poll(() => controller.state.open).toBe(false);
    expect(controller.state.query).toBe("");
  });

  it("names an empty choice with its placeholder on a narrow screen", async () => {
    const options = [{ value: "farce", label: "Farce" }];
    render(ChipGroup, {
      props: { legend: "Genres", name: "genres", searchLabel: "Search genres", placeholder: "Choose genres", options },
    });

    await expect.element(page.getByRole("button", { name: "Choose genres" })).toBeVisible();
  });

  it("draws a divider before each shown section but the first", () => {
    const options = [
      { value: "cyberpunk", label: "Cyberpunk", section: "Science fiction" },
      { value: "farce", label: "Farce", section: "Comedy" },
    ];
    const { container } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options } });

    const [first, second] = Array.from(container.querySelectorAll(".section"), (section) =>
      parseFloat(getComputedStyle(section).borderBlockStartWidth)
    );
    expect(first).toBe(0);
    expect(second).toBeGreaterThan(0);
  });

  it("dims its well while disabled", () => {
    const options = [{ value: "fantasy", label: "Fantasy" }];
    const { container } = render(ChipGroup, { props: { legend: "Genres", name: "genres", options, disabled: true } });

    const well = container.querySelector(".chips")!;
    expect(getComputedStyle(well).backgroundColor).toBe(resolveColor("var(--color-control-surface-disabled)"));
  });
});
