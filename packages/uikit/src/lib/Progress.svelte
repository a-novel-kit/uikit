<!--
@component
Shows labeled task progress against `max` (100 by default). Omit `value` for indeterminate work.
-->
<script lang="ts" module>
  import type { HTMLProgressAttributes } from "svelte/elements";

  /** Props for a labeled native progress indicator. */
  export interface ProgressProps extends HTMLProgressAttributes {
    /** Visible label for the operation. */
    label: string;
    /** Displays the current percentage beside the label. */
    showValue?: boolean;
  }
</script>

<script lang="ts">
  let { label, showValue = false, value, max = 100, class: className = "", ...rest }: ProgressProps = $props();

  const percentage = $derived(typeof value === "number" ? Math.round((value / Number(max)) * 100) : undefined);
</script>

<label class="progress {className}">
  <span class="heading">
    <span>{label}</span>
    {#if showValue && percentage !== undefined}<span>{percentage}%</span>{/if}
  </span>
  <progress {value} {max} {...rest}>{percentage}%</progress>
</label>

<style>
  .progress {
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
  progress {
    border: 0;
    border-radius: var(--radius-xl);
    background: var(--color-surface-island-strong);
    inline-size: 100%;
    block-size: var(--size-2);
    overflow: hidden;
    accent-color: var(--color-control-on);
  }

  progress::-webkit-progress-bar {
    background: var(--color-surface-island-strong);
  }
  progress::-webkit-progress-value {
    background: var(--color-control-on);
  }
  progress::-moz-progress-bar {
    background: var(--color-control-on);
  }
</style>
