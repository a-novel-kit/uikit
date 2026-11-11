<!--
@component
Groups content on a tokenized surface with optional header and footer snippets.
A raised card is frosted glass the app's lamp shines through. Inside another card, it keeps the
parent's glass and stands out by its shadow alone, so a group of settings can hold one card per option.
A ghost card is one item of a collection: the canvas's own color under a raised card's veil and blur,
ringed as a divider, and lit as a raised card under the pointer or once something in it takes the keyboard's focus.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a composable content surface. */
  export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Semantic surface depth. */
    surface?: "plain" | "subtle" | "raised" | "ghost" | "overlay";
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
  /* A raised card inside another is the parent's own glass, so the lamp tints both alike and text
     keeps the parent's contrast; only its shadow sets it apart. */
  .card :global(.card.surface-raised) {
    box-shadow: var(--shadow-md);
    background: transparent;
  }
  /* A ghost card is a raised card dark as the canvas, the same veil in the canvas's color, so a
     collection of them reads as the page itself until the pointer lights one. With no surface of its
     own to set it apart, its ring takes a divider's strength. */
  .surface-ghost {
    transition: background-color var(--duration-fast) var(--easing-standard);
    box-shadow: 0 0 0 var(--border-width-thin) var(--color-border-divider);
    background: color-mix(in oklab, var(--color-surface-canvas) var(--color-mix-2), transparent);
  }
  @media (hover: hover) {
    .surface-ghost:hover {
      background: var(--color-surface-island-glass);
    }
  }
  /* Svelte scopes a selector inside :has(), so the focus a consumer's link or button takes reaches it only as global. */
  .surface-ghost:has(:global(:focus-visible)) {
    background: var(--color-surface-island-glass);
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
    .surface-raised,
    .surface-ghost {
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
