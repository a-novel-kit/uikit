<script lang="ts" module>
  import type { HTMLProgressAttributes } from "svelte/elements";

  export interface ProgressProps extends HTMLProgressAttributes {
    label: string;
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
    font-size: var(--font-size-sm);
  }
  progress {
    border: 0;
    border-radius: var(--radius-xl);
    background: var(--color-surface-overlay);
    inline-size: 100%;
    block-size: var(--space-2);
    overflow: hidden;
    accent-color: var(--color-action-primary);
  }

  progress::-webkit-progress-bar {
    background: var(--color-surface-overlay);
  }
  progress::-webkit-progress-value {
    background: var(--color-action-primary);
  }
  progress::-moz-progress-bar {
    background: var(--color-action-primary);
  }
</style>
