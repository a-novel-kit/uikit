<script lang="ts" module>
  import type { LayoutGap } from "./Stack.svelte";

  import type { HTMLAttributes } from "svelte/elements";

  export interface InlineProps extends HTMLAttributes<HTMLDivElement> {
    /** Space between direct children, expressed on the public spacing scale. */
    gap?: LayoutGap;
    /** Cross-axis alignment. */
    align?: "start" | "center" | "end" | "stretch";
    /** Main-axis distribution. */
    justify?: "start" | "center" | "end" | "between";
    /** Allows children to wrap when the container narrows. */
    wrap?: boolean;
  }
</script>

<script lang="ts">
  let {
    gap = "2",
    align = "center",
    justify = "start",
    wrap = false,
    class: className = "",
    children,
    ...rest
  }: InlineProps = $props();
</script>

<div class="inline gap-{gap} align-{align} justify-{justify} {wrap ? 'wrap' : ''} {className}" {...rest}>
  {@render children?.()}
</div>

<style>
  .inline {
    display: flex;
    flex-direction: row;
    min-inline-size: 0;
  }

  .wrap {
    flex-wrap: wrap;
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
  .justify-start {
    justify-content: flex-start;
  }
  .justify-center {
    justify-content: center;
  }
  .justify-end {
    justify-content: flex-end;
  }
  .justify-between {
    justify-content: space-between;
  }
</style>
