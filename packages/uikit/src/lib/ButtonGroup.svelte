<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for grouping adjacent buttons as one related control set. */
  export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
    /** Direction in which buttons are arranged. */
    orientation?: "horizontal" | "vertical";
    /** Accessible name when surrounding text does not name the group. */
    label?: string;
  }
</script>

<script lang="ts">
  let { orientation = "horizontal", label, class: className = "", children, ...rest }: ButtonGroupProps = $props();
</script>

<div class="group {orientation} {className}" role="group" aria-label={label} {...rest}>
  {@render children?.()}
</div>

<style>
  .group {
    display: inline-flex;
    align-items: stretch;
    gap: var(--space-2);
  }

  .vertical {
    flex-direction: column;
  }
  .horizontal {
    flex-direction: row;
    flex-wrap: wrap;
  }
</style>
