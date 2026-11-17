<!--
@component
Lays out equal-width items in an intrinsic grid that wraps when its minimum item width no longer fits.
-->
<script lang="ts" module>
  import type { ComponentSize, LayoutGap } from "./types";

  import type { HTMLAttributes } from "svelte/elements";

  /** Props for an intrinsic grid that wraps at a minimum item width. */
  export interface GridProps extends HTMLAttributes<HTMLDivElement> {
    /** Minimum item width before the grid wraps. */
    minItemWidth?: ComponentSize;
    /** Space between grid items. */
    gap?: LayoutGap;
  }
</script>

<script lang="ts">
  let { minItemWidth = "md", gap = "4", class: className = "", children, ...rest }: GridProps = $props();
</script>

<div class="grid min-{minItemWidth} {className}" style:--grid-gap="var(--space-{gap})" {...rest}>
  {@render children?.()}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--grid-min)), 1fr));
    gap: var(--grid-gap);
    min-inline-size: 0;
  }

  .min-sm {
    --grid-min: calc(var(--font-size-base) * 12);
  }
  .min-md {
    --grid-min: var(--layout-sidebar);
  }
  .min-lg {
    --grid-min: calc(var(--font-size-base) * 20);
  }
</style>
