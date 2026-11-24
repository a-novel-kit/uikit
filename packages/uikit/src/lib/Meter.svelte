<!--
@component
Shows a labeled scalar measurement, with a default range of 0–100.
Use Progress for task completion.
-->
<script lang="ts" module>
  import type { HTMLMeterAttributes } from "svelte/elements";

  /** Props for a labeled native scalar measurement. */
  export interface MeterProps extends HTMLMeterAttributes {
    /** Visible label for the measurement. */
    label: string;
    /** Displays the current value beside the label. */
    showValue?: boolean;
  }
</script>

<script lang="ts">
  let { label, showValue = true, value, min = 0, max = 100, class: className = "", ...rest }: MeterProps = $props();
</script>

<label class="meter {className}">
  <span class="heading">
    <span>{label}</span>
    {#if showValue}<span>{value}</span>{/if}
  </span>
  <meter {value} {min} {max} {...rest}>{value}</meter>
</label>

<style>
  .meter {
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
  /* A browser draws a meter as a light bar in its own greens and reds. The track and its fill are drawn here
     instead, as a progress bar's: the fill is blue in its best range, amber next to it and magenta at its worst. */
  meter {
    appearance: none;
    border: 0;
    border-radius: var(--radius-xl);
    /* An empty track is one veil over what holds it, so it shows on every surface. */
    background: var(--color-action-neutral);
    inline-size: 100%;
    block-size: var(--size-2);
    overflow: hidden;
  }

  meter::-webkit-meter-bar {
    border: 0;
    border-radius: var(--radius-xl);
    /* The element draws the track. A veil painted here too would double. */
    background: transparent;
    block-size: var(--size-2);
  }

  meter::-webkit-meter-optimum-value {
    background: var(--color-control-on);
  }

  meter::-webkit-meter-suboptimum-value {
    background: var(--color-feedback-highlight-text);
  }

  meter::-webkit-meter-even-less-good-value {
    background: var(--color-feedback-error-text);
  }

  meter::-moz-meter-bar {
    background: var(--color-control-on);
  }

  meter:-moz-meter-sub-optimum::-moz-meter-bar {
    background: var(--color-feedback-highlight-text);
  }

  meter:-moz-meter-sub-sub-optimum::-moz-meter-bar {
    background: var(--color-feedback-error-text);
  }
</style>
