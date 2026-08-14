<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a composable content surface. */
  export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Semantic surface depth. */
    surface?: "plain" | "subtle" | "raised" | "overlay";
    /** Internal spacing applied around all card regions. */
    padding?: "none" | "sm" | "md" | "lg";
    /** Optional leading region. */
    header?: Snippet;
    /** Optional trailing region. */
    footer?: Snippet;
  }
</script>

<script lang="ts">
  let {
    surface = "raised",
    padding = "md",
    header,
    footer,
    class: className = "",
    children,
    ...rest
  }: CardProps = $props();
</script>

<div class="card surface-{surface} padding-{padding} {className}" {...rest}>
  {#if header}<div class="header">{@render header()}</div>{/if}
  <div class="content">{@render children?.()}</div>
  {#if footer}<div class="footer">{@render footer()}</div>{/if}
</div>

<style>
  .card {
    box-sizing: border-box;
    border-radius: var(--radius-lg);
    min-inline-size: 0;
    overflow: clip;
    color: var(--color-text-primary);
  }

  .surface-plain {
    background: transparent;
  }
  .surface-subtle {
    background: var(--color-surface-island-subtle);
  }
  .surface-raised {
    box-shadow: var(--shadow-sm);
    background: var(--color-surface-island);
  }
  .surface-overlay {
    box-shadow: var(--shadow-island);
    background: var(--color-surface-island-strong);
  }
  .padding-none {
    --card-padding: var(--space-0);
  }
  .padding-sm {
    --card-padding: var(--space-3);
  }
  .padding-md {
    --card-padding: var(--space-4);
  }
  .padding-lg {
    --card-padding: var(--space-6);
  }

  .header,
  .content,
  .footer {
    padding: var(--card-padding);
  }

  .header + .content,
  .content + .footer {
    padding-block-start: var(--card-padding);
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    .surface-overlay {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }
  }

  @media (forced-colors: active) {
    .card:not(.surface-plain) {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
