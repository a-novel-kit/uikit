<script lang="ts" module>
  import type { HTMLInputAttributes } from "svelte/elements";

  /** Props for a labeled native range input. */
  export interface SliderProps extends Omit<HTMLInputAttributes, "type" | "value"> {
    /** Visible label for the range input. */
    label: string;
    /** Current numeric value. */
    value?: number;
    /** Displays the current value beside the label. */
    showValue?: boolean;
  }
</script>

<script lang="ts">
  let {
    label,
    value = $bindable(0),
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

    return Math.min(100, Math.max(0, ((value - minimum) / range) * 100));
  });
</script>

<label class="slider {className}">
  <span class="heading">
    <span>{label}</span>
    {#if showValue}<output>{value}</output>{/if}
  </span>
  <input bind:value type="range" {min} {max} {...rest} style:--slider-progress={`${progress}%`} />
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
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-sm);
  }

  output {
    color: var(--color-text-muted);
    font-family: var(--font-family-mono);
  }
  input {
    --slider-fill: var(--color-action-primary);
    --slider-track: var(--color-control-surface-hover);

    appearance: none;
    cursor: pointer;
    margin: 0;
    outline: none;
    background: transparent;
    inline-size: 100%;
    block-size: var(--control-height-md);
  }

  input:hover:not(:disabled, :focus-visible) {
    --slider-fill: var(--color-action-primary-hover);
  }

  input:active:not(:disabled, :focus-visible) {
    --slider-fill: var(--color-action-primary-selected);
  }

  input:focus-visible {
    --slider-fill: var(--color-action-primary-hover);
    --slider-track: var(--color-control-surface-focus);
  }

  input::-webkit-slider-runnable-track {
    border-radius: var(--radius-round);
    background: linear-gradient(
      90deg,
      var(--slider-fill) 0 var(--slider-progress),
      var(--slider-track) var(--slider-progress) 100%
    );
    block-size: var(--space-1);
  }

  input::-webkit-slider-thumb {
    appearance: none;
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      border-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
    margin-block-start: calc(var(--space-2) * -1);
    border: var(--border-width-thin) solid var(--color-control-border-focus);
    border-radius: var(--radius-round);
    background: var(--slider-fill);
    inline-size: var(--icon-size-md);
    block-size: var(--icon-size-md);
  }

  input::-moz-range-track {
    border-radius: var(--radius-round);
    background: var(--slider-track);
    block-size: var(--space-1);
  }

  input::-moz-range-progress {
    border-radius: var(--radius-round);
    background: var(--slider-fill);
    block-size: var(--space-1);
  }

  input::-moz-range-thumb {
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      border-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
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

  input:active:not(:disabled)::-webkit-slider-thumb {
    box-shadow: var(--shadow-action-selected);
  }

  input:active:not(:disabled)::-moz-range-thumb {
    box-shadow: var(--shadow-action-selected);
  }

  input:disabled {
    --slider-fill: var(--color-action-disabled-border);
    --slider-track: var(--color-action-disabled-surface);

    cursor: not-allowed;
  }
  input:disabled::-webkit-slider-thumb {
    border-color: var(--color-action-disabled-border);
  }
  input:disabled::-moz-range-thumb {
    border-color: var(--color-action-disabled-border);
  }
  .slider:has(input:disabled) {
    color: var(--color-text-disabled);
  }
</style>
