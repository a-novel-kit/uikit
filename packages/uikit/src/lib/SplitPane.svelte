<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a main region paired with a responsive secondary pane. */
  export interface SplitPaneProps extends HTMLAttributes<HTMLDivElement> {
    /** Secondary pane content. */
    aside: Snippet;
    /** Places the secondary pane before or after the main content. */
    asidePosition?: "start" | "end";
    /** Accessible name for the secondary region. */
    asideLabel?: string;
  }
</script>

<script lang="ts">
  let {
    aside,
    asidePosition = "end",
    asideLabel = "Context",
    class: className = "",
    children,
    ...rest
  }: SplitPaneProps = $props();
</script>

<div class="split {asidePosition} {className}" {...rest}>
  <section class="primary">{@render children?.()}</section>
  <aside class="secondary" aria-label={asideLabel}>{@render aside()}</aside>
</div>

<style>
  .split {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: var(--layout-island-gap);
    background: transparent;
    min-inline-size: 0;
  }

  .primary {
    flex: var(--ratio-major) 1 var(--layout-container-sm);
    box-sizing: border-box;
    padding: var(--layout-gutter);
    min-inline-size: min(100%, var(--layout-container-sm));
  }

  .secondary {
    flex: 1 1 var(--layout-sidebar);
    box-sizing: border-box;
    box-shadow: var(--shadow-island);
    border-radius: var(--radius-lg);
    background: var(--color-surface-island);
    padding: var(--layout-gutter);
    min-inline-size: min(100%, var(--layout-sidebar));
  }

  .start {
    flex-direction: row-reverse;
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    .secondary {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }
  }

  @media (forced-colors: active) {
    .secondary {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
