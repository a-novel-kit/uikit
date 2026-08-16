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
    font-size: var(--font-size-sm);
  }
  meter {
    border: 0;
    border-radius: var(--radius-xl);
    background: var(--color-surface-overlay);
    inline-size: 100%;
    block-size: var(--space-2);
    accent-color: var(--color-action-primary);
  }
</style>
