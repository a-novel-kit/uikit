<script lang="ts" module>
  import type { LayoutGap } from "./types";

  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a vertical layout with tokenized spacing. */
  export interface StackProps extends HTMLAttributes<HTMLDivElement> {
    /** Space between direct children, expressed on the public spacing scale. */
    gap?: LayoutGap;
    /** Cross-axis alignment. */
    align?: "start" | "center" | "end" | "stretch";
  }
</script>

<script lang="ts">
  let { gap = "4", align = "stretch", class: className = "", children, ...rest }: StackProps = $props();
</script>

<div class="stack gap-{gap} align-{align} {className}" {...rest}>
  {@render children?.()}
</div>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
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

  .align-start {
    align-items: flex-start;
  }
  .align-center {
    align-items: center;
  }
  .align-end {
    align-items: flex-end;
  }
  .align-stretch {
    align-items: stretch;
  }
</style>
