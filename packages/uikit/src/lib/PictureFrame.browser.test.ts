/// <reference types="vite/client" />
import PictureFrame from "./PictureFrame.svelte";
import { createPictureFrameController } from "./controllers.svelte";
import type { AspectRatio } from "./picture";

import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><rect width="1600" height="1200" fill="midnightblue"/></svg>`;
const photo = { url: `data:image/svg+xml,${encodeURIComponent(markup)}`, width: 1600, height: 1200 };
const square = { width: 1, height: 1 };
const wide = { width: 16, height: 9 };

/** Frames the 4:3 photo, from its center, and returns the controller with the frame's locator. */
function frame(ratio: AspectRatio = wide, props: { disabled?: boolean } = {}) {
  const controller = createPictureFrameController({ source: photo, ratio });
  render(PictureFrame, { controller, ...props });
  return { controller, stage: page.getByRole("application", { name: "Picture frame" }) };
}

describe("PictureFrame", () => {
  it.each([
    { ratio: square, viewport: 1280, size: [320, 320] },
    { ratio: wide, viewport: 1280, size: [568.89, 320] },
    { ratio: square, viewport: 390, size: [320, 320] },
    { ratio: wide, viewport: 390, size: [390, 219.375] },
  ])("fills its container up to 20rem tall, at $ratio.width:$ratio.height on $viewport px", async (scenario) => {
    await page.viewport(scenario.viewport, 800);
    const { stage } = frame(scenario.ratio);

    await expect.element(stage).toHaveAccessibleDescription(/^Drag the image or use the arrow keys/);
    const box = stage.element().getBoundingClientRect();
    expect(box.width).toBeCloseTo(scenario.size[0], 0);
    expect(box.height).toBeCloseTo(scenario.size[1], 0);
  });

  it("shows the crop the slider zooms to, then moves it with the arrow keys and zooms with + and -", async () => {
    const { controller, stage } = frame();

    await page.getByRole("slider", { name: "Zoom" }).fill("2");
    expect(controller.state.crop).toEqual({ zoom: 2, x: 400, y: 375 });
    const box = stage.element().getBoundingClientRect();
    const image = stage.element().querySelector("img")!.getBoundingClientRect();
    expect(image.width).toBeCloseTo(box.width * 2);
    expect(image.left - box.left).toBeCloseTo(-box.width / 2);
    expect(image.top - box.top).toBeCloseTo((-375 / 450) * box.height);

    await userEvent.click(stage);
    await userEvent.keyboard("{ArrowLeft}{ArrowUp}");
    expect(controller.state.crop).toEqual({ zoom: 2, x: 440, y: 415 });

    await userEvent.keyboard("+");
    expect(controller.state.crop.zoom).toBeCloseTo(2.2);
    await userEvent.keyboard("-");
    expect(controller.state.crop.zoom).toBeCloseTo(2);
    expect(controller.state.crop.x).toBeCloseTo(440);
    expect(controller.state.crop.y).toBeCloseTo(415);
  });

  it("zooms on the wheel around the pointer and keeps the page still", () => {
    const { controller, stage } = frame();
    const box = stage.element().getBoundingClientRect();

    const wheel = new WheelEvent("wheel", { deltaY: -500, clientX: box.left, clientY: box.top, cancelable: true });
    stage.element().dispatchEvent(wheel);

    expect(wheel.defaultPrevented).toBe(true);
    expect(controller.state.crop.zoom).toBeCloseTo(Math.E);
    expect(controller.state.crop).toMatchObject({ x: 0, y: 150 });
  });

  it("pans with a drag and zooms with a pinch around the fingers", () => {
    const { controller, stage } = frame();
    const element = stage.element() as HTMLElement;
    // Synthetic pointers are not active pointers, which the browser refuses to capture.
    element.setPointerCapture = () => {};
    const box = element.getBoundingClientRect();
    controller.zoom(2);
    const pointer = (type: string, pointerId: number, x: number, y: number) =>
      element.dispatchEvent(
        new PointerEvent(type, { pointerId, clientX: box.left + x, clientY: box.top + y, bubbles: true })
      );

    pointer("pointerdown", 1, 100, 100);
    pointer("pointermove", 1, 100 - box.width / 10, 100 + box.width / 20);
    pointer("pointerup", 1, 100 - box.width / 10, 100 + box.width / 20);
    expect(controller.state.crop).toEqual({ zoom: 2, x: 480, y: 335 });

    pointer("pointerdown", 1, 0, 0);
    pointer("pointerdown", 2, box.width / 2, box.height / 2);
    pointer("pointermove", 2, box.width, box.height);
    expect(controller.state.crop.zoom).toBeCloseTo(4);
    expect(controller.state.crop.x).toBeCloseTo(680);
    expect(controller.state.crop.y).toBeCloseTo(447.5);
  });

  it("keeps the image still while disabled", async () => {
    const { controller, stage } = frame(wide, { disabled: true });

    stage.element().focus();
    await userEvent.keyboard("{ArrowLeft}+");

    expect(controller.state.crop).toEqual({ zoom: 1, x: 0, y: 150 });
    await expect.element(stage).toHaveAttribute("aria-disabled", "true");
    await expect.element(page.getByRole("slider", { name: "Zoom" })).toBeDisabled();
  });

  it("names the frame and its slider apart when a form holds several", async () => {
    const controller = createPictureFrameController({ source: photo, ratio: square });
    render(PictureFrame, { controller, label: "Logo frame", zoomLabel: "Logo zoom" });

    await expect.element(page.getByRole("application", { name: "Logo frame" })).toBeVisible();
    await expect.element(page.getByRole("slider", { name: "Logo zoom" })).toBeVisible();
  });
});
