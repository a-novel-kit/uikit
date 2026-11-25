<!--
@component
Renders a labeled native range input driven by a numeric value controller.
The default range is 0–100; the caller owns persistence and value validation.
-->
<script lang="ts" module>
  import type { ValueController } from "./controllers.svelte";

  import type { HTMLInputAttributes } from "svelte/elements";

  /** External state contract for a slider. */
  export type SliderController = ValueController<number>;

  /** Props for a labeled native range input. */
  export interface SliderProps extends Omit<HTMLInputAttributes, "type" | "value" | "oninput"> {
    /** Visible label for the range input. */
    label: string;
    /** State owner that decides whether value requests take effect. */
    controller: SliderController;
    /** Displays the current value beside the label. */
    showValue?: boolean;
  }
</script>

<script lang="ts">
  let {
    label,
    controller,
    showValue = true,
    min = 0,
    max = 100,
    class: className = "",
    ...rest
  }: SliderProps = $props();

  const progress = $derived.by(() => {
    const minimum = Number(min);
    const range = Number(max) - minimum;

    if (!Number.isFinite(range) || range <= 0) return 0;

    return Math.min(100, Math.max(0, ((controller.state.value - minimum) / range) * 100));
  });

  function handleInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    controller.setValue(target.valueAsNumber);
    target.value = String(controller.state.value);
  }
</script>

<label class="slider {className}">
  <span class="heading">
    <span>{label}</span>
    {#if showValue}<output>{controller.state.value}</output>{/if}
  </span>
  <!-- The value comes last: set before its range and step, a browser rounds it to the default ones, and the thumb
       leaves the fill. -->
  <input
    type="range"
    {min}
    {max}
    oninput={handleInput}
    {...rest}
    value={controller.state.value}
    style:--slider-progress={`${progress}%`}
  />
</label>

<style>
  .slider {
    display: grid;
    gap: var(--space-2);
    color: var(--color-text-secondary);
  }
  .heading {
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
    font: var(--text-ui);
  }

  output {
    color: var(--color-text-muted);
    font: var(--text-code);
  }
  input {
    --slider-fill: var(--color-control-on);
    /* An empty track is one veil over what holds it, as a progress bar's and a meter's, so it shows on every
       surface. An opaque island tone vanished on that island. */
    --slider-track: var(--color-action-neutral);

    appearance: none;
    cursor: pointer;
    margin: 0;
    outline: none;
    background: transparent;
    inline-size: 100%;
    block-size: var(--control-height-md);
  }

  /* The pointer, a press and the keyboard's focus lift the fill. */
  @media (hover: hover) {
    input:hover:not(:disabled) {
      --slider-fill: var(--color-control-on-hover);
    }
  }

  input:is(:active, :focus-visible):not(:disabled) {
    --slider-fill: var(--color-control-on-hover);
  }

  input::-webkit-slider-runnable-track {
    border-radius: var(--radius-round);
    background: linear-gradient(
      90deg,
      var(--slider-fill) 0 var(--slider-progress),
      var(--slider-track) var(--slider-progress) 100%
    );
    block-size: var(--size-1);
  }

  input::-webkit-slider-thumb {
    appearance: none;
    transition:
      background-color var(--motion-state),
      border-color var(--motion-state),
      box-shadow var(--motion-state);
    /* off-scale: half the thumb's height past the track's, which centers it on the track */
    margin-block-start: calc(var(--size-2) * -1);
    border: var(--border-width-thin) solid var(--color-control-border-focus);
    border-radius: var(--radius-round);
    background: var(--slider-fill);
    inline-size: var(--icon-size-md);
    block-size: var(--icon-size-md);
  }

  input::-moz-range-track {
    border-radius: var(--radius-round);
    background: var(--slider-track);
    block-size: var(--size-1);
  }

  input::-moz-range-progress {
    border-radius: var(--radius-round);
    background: var(--slider-fill);
    block-size: var(--size-1);
  }

  input::-moz-range-thumb {
    transition:
      background-color var(--motion-state),
      border-color var(--motion-state),
      box-shadow var(--motion-state);
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-control-border-focus);
    border-radius: var(--radius-round);
    background: var(--slider-fill);
    inline-size: var(--icon-size-md);
    block-size: var(--icon-size-md);
  }

  input:focus-visible::-webkit-slider-thumb {
    outline: none;
    box-shadow: var(--shadow-focus-ring);
  }

  input:focus-visible::-moz-range-thumb {
    outline: none;
    box-shadow: var(--shadow-focus-ring);
  }

  @media (forced-colors: active) {
    input:focus-visible::-webkit-slider-thumb,
    input:focus-visible::-moz-range-thumb {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }
  }

  /* Disabled, the value still reads, in the muted text's color, on an inert track. */
  input:disabled {
    --slider-fill: var(--color-action-disabled-text);
    --slider-track: var(--color-action-disabled-surface);

    cursor: not-allowed;
  }
  input:disabled::-webkit-slider-thumb {
    border-color: transparent;
  }
  input:disabled::-moz-range-thumb {
    border-color: transparent;
  }
  .slider:has(input:disabled) {
    color: var(--color-text-disabled);
  }
</style>
