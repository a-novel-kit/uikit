<!--
@component
Groups content on a tokenized surface with optional header and footer snippets.
A raised card is frosted glass the app's lamp shines through. Inside another card, it keeps the
parent's glass and stands out by its shadow alone, so a group of settings can hold one card per option.
A ghost card is one item of a collection: the canvas's own color under a raised card's veil and blur, ringed in the
veil that fills it once lit, and lit as a raised card under the pointer or once something in it takes the keyboard's
focus. A card holds its section's content: `Section` titles it from outside, and a card names itself only as an item.

A card inside another sits half the parent's radius from its edge and takes the next radius step down, so their
corners stay concentric at any depth. Other content sits a spacing step further in.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a composable content surface. */
  export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Semantic surface depth. */
    surface?: "plain" | "subtle" | "raised" | "ghost" | "overlay";
    /** Internal spacing around all card regions, or none for content that reaches the edges. */
    padding?: "none" | "md";
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

  // A subtle or plain card has no blur, so a modal dialog has none to drop.
  const frosted = $derived(surface === "raised" || surface === "ghost" || surface === "overlay");
</script>

<div
  class="card surface-{surface} padding-{padding} {className}"
  data-frost={frosted || undefined}
  data-island={surface === "plain" ? undefined : ""}
  {...rest}
>
  {#if header}<div class="header">{@render header()}</div>{/if}
  <div class="content">{@render children?.()}</div>
  {#if footer}<div class="footer">{@render footer()}</div>{/if}
</div>

<style>
  /* A card sits on its own radius, or on the one its parent card leaves to its regions. A nested card sits the
     parent's inset from its edge, past the parent's padding, which is a spacing step wider. */
  .card {
    --card-radius: var(--card-nested-radius, var(--radius-xl));
    --card-inset: calc(var(--card-radius) / 2);
    --card-padding: calc(var(--card-inset) * 1.5);
    box-sizing: border-box;
    border-radius: var(--card-radius);
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
    -webkit-backdrop-filter: blur(var(--blur-md));
    backdrop-filter: blur(var(--blur-md));
    box-shadow: var(--shadow-ring);
    background: var(--color-surface-island-glass);
  }
  /* A raised card inside another is the parent's own glass, so the lamp tints both alike and text
     keeps the parent's contrast; only its shadow sets it apart. */
  .card :global(.card.surface-raised) {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: var(--shadow-md);
    background: transparent;
  }
  /* A ghost card is a raised card dark as the canvas, the same veil in the canvas's color, so a
     collection of them reads as the page itself until the pointer lights one. With no surface of its
     own to set it apart, it takes an outline for its ring: the veil that fills it once lit. */
  .surface-ghost {
    -webkit-backdrop-filter: blur(var(--blur-md));
    backdrop-filter: blur(var(--blur-md));
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      outline-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
    /* An outline is painted last, above the card's own fill. A ring drawn as a shadow sits under that fill, whose
       edge then eats the ring's inner antialiasing: the ring thins along every corner and reads as cropped. */
    outline: var(--border-width-outline) solid var(--color-border-item);
    background: color-mix(in oklab, var(--color-surface-canvas) var(--color-mix-2), transparent);
  }
  @media (hover: hover) {
    .surface-ghost:hover {
      background: var(--color-surface-island-glass);
    }
  }
  /* Svelte scopes a selector inside :has(), so the focus a consumer's link or button takes reaches it only as
     global. */
  .surface-ghost:has(:global(:focus-visible)) {
    background: var(--color-surface-island-glass);
  }
  /* A ghost card inside another card drops its own blur, and lit, it is the parent's own glass, as a nested raised
     card is: a second blur and veil would light it past its parent and drop its text below 4.5:1. */
  .card :global(.card.surface-ghost) {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  @media (hover: hover) {
    .card :global(.card.surface-ghost:hover) {
      outline-color: transparent;
      box-shadow: var(--shadow-md);
      background: transparent;
    }
  }
  .card :global(.card.surface-ghost:has(:focus-visible)) {
    outline-color: transparent;
    box-shadow: var(--shadow-md);
    background: transparent;
  }
  .surface-overlay {
    -webkit-backdrop-filter: blur(var(--blur-md));
    backdrop-filter: blur(var(--blur-md));
    box-shadow: var(--shadow-island);
    background: var(--color-surface-glass);
  }
  /* Content that reaches the edges keeps to the rounded corners. A padded card clips nothing, so the
     glow of an action inside spills past its edge. */
  .padding-none {
    --card-inset: var(--space-0);
    --card-padding: var(--space-0);
    overflow: clip;
  }

  /* A card nested in a region sits the inset away from this card's edge, so its radius is this card's less the
     inset: the next radius step down, or this card's own radius without padding. A nested card first or last in
     its parent also reaches the inset on that side. */
  .header,
  .content,
  .footer {
    --card-nested-radius: calc(var(--card-radius) - var(--card-inset));
    --card-nested-offset: calc(var(--card-inset) - var(--card-padding));
    padding: var(--card-padding);
  }
  .card :global(.card) {
    margin-inline: var(--card-nested-offset);
  }
  .card :global(.card:first-child) {
    margin-block-start: var(--card-nested-offset);
  }
  .card :global(.card:last-child) {
    margin-block-end: var(--card-nested-offset);
  }

  @media (forced-colors: active) {
    .card:not(.surface-plain) {
      border: var(--border-width-thin) solid CanvasText;
    }

    /* The border above already rings a ghost card. */
    .surface-ghost {
      outline: none;
    }
  }
</style>
