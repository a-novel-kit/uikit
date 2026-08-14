<script lang="ts" module>
  import type { LayoutGap } from "./Stack.svelte";

  import type { HTMLAttributes } from "svelte/elements";

  export interface GridProps extends HTMLAttributes<HTMLDivElement> {
    /** Minimum card width before the intrinsic grid wraps. */
    minItemWidth?: "sm" | "md" | "lg";
    /** Space between grid items. */
    gap?: LayoutGap;
  }
</script>

<script lang="ts">
  let { minItemWidth = "md", gap = "4", class: className = "", children, ...rest }: GridProps = $props();
</script>

<div class="grid min-{minItemWidth} gap-{gap} {className}" {...rest}>
  {@render children?.()}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--grid-min)), 1fr));
    min-inline-size: 0;
  }

  .min-sm {
    --grid-min: calc(var(--font-size-base) * var(--multiplier-12));
  }
  .min-md {
    --grid-min: var(--layout-sidebar);
  }
  .min-lg {
    --grid-min: calc(var(--font-size-base) * var(--multiplier-20));
  }
  .gap-0 {
    gap: var(--space-0);
  }
  .gap-1 {
    gap: var(--space-1);
  }
  .gap-2 {
    gap: var(--space-2);
  }
  .gap-3 {
    gap: var(--space-3);
  }
  .gap-4 {
    gap: var(--space-4);
  }
  .gap-6 {
    gap: var(--space-6);
  }
  .gap-8 {
    gap: var(--space-8);
  }
  .gap-12 {
    gap: var(--space-12);
  }
  .gap-16 {
    gap: var(--space-16);
  }
</style>
