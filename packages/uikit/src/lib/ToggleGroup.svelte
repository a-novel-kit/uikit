<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for grouping related independent toggle buttons. */
  export interface ToggleGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    label: string;
    orientation?: "horizontal" | "vertical";
    children: Snippet;
  }
</script>

<script lang="ts">
  let { label, orientation = "horizontal", children, class: className = "", ...rest }: ToggleGroupProps = $props();
</script>

<div class="toggle-group {orientation} {className}" role="group" aria-label={label} {...rest}>
  {@render children()}
</div>

<style>
  .toggle-group {
    display: inline-flex;
    align-items: stretch;
    gap: var(--space-1);
    border-radius: var(--radius-lg);
    background: var(--color-surface-sunken);
    padding: var(--space-1);
  }

  .horizontal {
    flex-flow: row wrap;
  }

  .vertical {
    flex-direction: column;
  }
</style>
