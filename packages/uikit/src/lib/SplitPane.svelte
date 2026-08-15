<script lang="ts" module>
  import type { LayoutGap } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a responsive two-region layout. */
  export interface SplitPaneProps extends HTMLAttributes<HTMLDivElement> {
    /** Content rendered in the narrower pane. */
    secondary: Snippet;
    /** Places the narrower pane before or after the primary content. */
    secondaryPosition?: "start" | "end";
    /** Space between the two regions, expressed on the public spacing scale. */
    gap?: LayoutGap;
  }
</script>

<script lang="ts">
  let {
    secondary,
    secondaryPosition = "end",
    gap = "4",
    class: className = "",
    children,
    ...rest
  }: SplitPaneProps = $props();
</script>

{#snippet secondaryPane()}
  <div class="secondary">{@render secondary()}</div>
{/snippet}

<div class="split gap-{gap} {className}" {...rest}>
  {#if secondaryPosition === "start"}{@render secondaryPane()}{/if}
  <div class="primary">{@render children?.()}</div>
  {#if secondaryPosition === "end"}{@render secondaryPane()}{/if}
</div>

<style>
  .split {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    min-inline-size: 0;
  }

  .primary {
    flex: var(--ratio-major) 1 var(--layout-container-sm);
    min-inline-size: min(100%, var(--layout-container-sm));
  }

  .secondary {
    flex: 1 1 var(--layout-sidebar);
    min-inline-size: min(100%, var(--layout-sidebar));
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
