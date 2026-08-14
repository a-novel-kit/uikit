<script lang="ts" module>
  import type { HTMLTableAttributes } from "svelte/elements";

  export interface TableProps extends HTMLTableAttributes {
    caption?: string;
    /** Keeps rows compact for data-dense views. */
    density?: "compact" | "default";
  }
</script>

<script lang="ts">
  let { caption, density = "default", class: className = "", children, ...rest }: TableProps = $props();
</script>

<!-- Keyboard focus lets non-pointer users scroll a table when it overflows. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="scroller" tabindex="0" role="region" aria-label={caption ? `Table: ${caption}` : "Scrollable table"}>
  <table class="{density} {className}" {...rest}>
    {#if caption}<caption>{caption}</caption>{/if}
    {@render children?.()}
  </table>
</div>

<style>
  .scroller {
    border: var(--border-width-thin) solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    max-inline-size: 100%;
    overflow: auto;
  }

  .scroller:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  table {
    border-collapse: collapse;
    background: var(--color-surface-sunken);
    inline-size: 100%;
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
  }

  caption {
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-bold);
    text-align: start;
  }

  :global(th),
  :global(td) {
    vertical-align: top;
    border-block-end: var(--border-width-thin) solid var(--color-border-subtle);
    padding: var(--table-padding);
    text-align: start;
  }

  :global(th) {
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-bold);
  }
  :global(tbody tr:hover) {
    background: var(--color-surface-hover);
  }
  .compact {
    --table-padding: var(--space-2) var(--space-3);
  }
  .default {
    --table-padding: var(--space-3) var(--space-4);
  }
</style>
