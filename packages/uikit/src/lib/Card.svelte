<!--
@component
Groups content on a tokenized surface with optional header and footer snippets.
A raised card is frosted glass the app's lamp shines through. Inside another card, it turns opaque
with a small shadow, so a group of settings can hold one card per option.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a composable content surface. */
  export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Semantic surface depth. */
    surface?: "plain" | "subtle" | "raised" | "overlay";
    /** Internal spacing applied around all card regions. */
    padding?: "none" | "sm" | "md" | "lg";
    /** Region rendered before the content. */
    header?: Snippet;
    /** Region rendered after the content. */
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
    color: var(--color-text-primary);
  }

  .surface-plain {
    background: transparent;
  }
  .surface-subtle {
    background: var(--color-surface-island-subtle);
  }
  /* Frosted glass: the lamp shines through a raised card as through the navigation. */
  .surface-raised {
    box-shadow: var(--shadow-ring);
    background: var(--color-surface-island-glass);
  }
  /* A raised card inside another stands on it: opaque, with a small shadow for volume. */
  .card :global(.card.surface-raised) {
    box-shadow: var(--shadow-sm);
    background: var(--color-surface-island-strong);
  }
  .surface-overlay {
    box-shadow: var(--shadow-island);
    background: var(--color-surface-island-strong);
  }
  /* Content that reaches the edges keeps to the rounded corners. A padded card clips nothing, so the
     glow of an action inside spills past its edge. */
  .padding-none {
    --card-padding: var(--space-0);
    overflow: clip;
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

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    .surface-raised {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
    }
    .card :global(.card.surface-raised) {
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }
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
