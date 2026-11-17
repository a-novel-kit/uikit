<!--
@component
A bar that stays at one edge of the page while content scrolls under it, behind frosted glass: clear at the top,
darkened to the canvas at the foot.
A shell whose own bars cover the page's edges sets `--shell-sticky-top` and `--shell-sticky-bottom` to their sizes,
and the bar stays clear of them.
-->
<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a bar that stays at one edge of the scrolling page. */
  export interface StickyBarProps extends HTMLAttributes<HTMLElement> {
    /** The edge of the scrolling page the bar stays at. */
    edge: "start" | "end";
    /** Spans the page's `--layout-gutter`, so what scrolls under the bar never shows beside it; defaults to false. */
    bleed?: boolean;
    /** Root element of the bar, such as `nav` for a bar of links; defaults to `div`. */
    as?: "div" | "nav";
  }
</script>

<script lang="ts">
  let { edge, bleed = false, as = "div", class: className = "", children, ...rest }: StickyBarProps = $props();
</script>

<svelte:element this={as} class="sticky-bar {edge} {className}" class:bleed data-frost {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  /* Glass: the lamp shines through it, and only what scrolls under it frosts. Like any layout, it draws no line. */
  .sticky-bar {
    position: sticky;
    z-index: var(--layer-sticky);
    -webkit-backdrop-filter: blur(var(--blur-lg));
    backdrop-filter: blur(var(--blur-lg));
    background: transparent;
  }

  .start {
    inset-block-start: var(--shell-sticky-top, 0);
  }

  /* A bar at the page's foot holds actions under the thumb, over whatever scrolls by: it darkens to the canvas under
     its frost, as the navigation does, so its controls stand clear of the content. */
  .end {
    inset-block-end: var(--shell-sticky-bottom, 0);
    background: color-mix(in oklab, var(--color-surface-canvas) var(--color-mix-12), transparent);
  }

  .bleed {
    margin-inline: calc(-1 * var(--layout-gutter));
    padding-inline: var(--layout-gutter);
  }
</style>
