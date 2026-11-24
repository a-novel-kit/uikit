/// <reference types="vite/client" />
import { contrast, painted, resolveColor } from "../../test/style";
import Meter from "./Meter.svelte";
import Progress from "./Progress.svelte";
import Slider from "./Slider.svelte";
import { createValueController } from "./controllers.svelte";

import { describe, expect, it } from "vitest";

import "@a-novel-kit/uikit-tokens/tokens.css";

import { render } from "@testing-library/svelte";

/** Each control's empty track, as the color its own styles resolve to. */
const tracks = {
  slider() {
    const { container } = render(Slider, { label: "Zoom", controller: createValueController({ initialValue: 20 }) });
    const slider = container.querySelector("input")!;
    return resolveColor(getComputedStyle(slider).getPropertyValue("--slider-track"), slider.parentElement!);
  },
  "progress bar"() {
    const { container } = render(Progress, { label: "Upload", value: 20 });
    return getComputedStyle(container.querySelector("progress")!).backgroundColor;
  },
  meter() {
    const { container } = render(Meter, { label: "Storage", value: 20 });
    return getComputedStyle(container.querySelector("meter")!).backgroundColor;
  },
};

describe("an empty track", () => {
  // An opaque island tone vanished on that island: 1:1 in a dialog and 1.06:1 on a card.
  it.each(Object.keys(tracks) as (keyof typeof tracks)[])("shows on every surface under a %s", (control) => {
    const track = tracks[control]();
    const canvas = resolveColor("var(--color-surface-canvas)");
    const backdrops = [
      [canvas],
      [canvas, resolveColor("var(--color-surface-island-glass)")],
      [resolveColor("var(--color-surface-island-strong)")],
    ];

    for (const backdrop of backdrops) {
      expect(contrast(painted(...backdrop, track), painted(...backdrop))).toBeGreaterThanOrEqual(1.2);
    }
  });
});
