<!--
@component
Places primary and secondary content side by side when space permits, stacking in DOM order on narrow screens.
-->
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

<div class="split {className}" style:--split-gap="var(--space-{gap})" {...rest}>
  {#if secondaryPosition === "start"}{@render secondaryPane()}{/if}
  <div class="primary">{@render children?.()}</div>
  {#if secondaryPosition === "end"}{@render secondaryPane()}{/if}
</div>

<style>
  .split {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: var(--split-gap);
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
</style>
