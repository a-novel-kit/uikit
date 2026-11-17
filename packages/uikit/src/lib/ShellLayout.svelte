<!--
@component
Lays out an app's shell: a collapsible rail beside the page on wide screens, and a header one control tall, fixed to
the top, on narrow ones, both on the navigation surface. A banner stays in view above the page on wide screens and
at its bottom on narrow ones. The app renders its own landmarks, links and labels into the snippets.

The page reads `--shell-sticky-top` and `--shell-sticky-bottom`, the sizes of the header and banner that cover its
edges, so a `StickyBar` stays clear of them.

```svelte
<script lang="ts">
  import { ShellLayout } from "@a-novel-kit/uikit";
</script>

<ShellLayout collapsed={railCollapsed}>
  {#snippet rail()}<aside aria-label="Navigation">…</aside>{/snippet}
  {#snippet header()}<header>…</header>{/snippet}
  <main id="main-content" tabindex="-1">…</main>
</ShellLayout>
```
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";

  /** Props for the geometry of an app's shell. */
  export interface ShellLayoutProps {
    /** Narrows the rail to one small control; defaults to false. */
    collapsed?: boolean;
    /** The app's navigation, shown as a rail on wide screens, which it fills. */
    rail: Snippet;
    /** The app's header, shown on narrow screens, which it fills. */
    header: Snippet;
    /** A notice that stays in view while the page scrolls, such as a `DowntimeBanner`. */
    banner?: Snippet;
    /** The page, inside the app's `main` landmark. */
    children: Snippet;
  }
</script>

<script lang="ts">
  let { collapsed = false, rail, header, banner, children }: ShellLayoutProps = $props();

  /** The height of the banner, which the page's sticky parts stay clear of. */
  let bannerBlockSize = $state(0);
</script>

<div class="shell-layout">
  <div class="shell" class:collapsed>
    <div class="rail">{@render rail()}</div>

    <!-- A column, so the header and banner stay in view across the whole page. -->
    <div class="workspace" style:--shell-banner-block-size="{banner ? bannerBlockSize : 0}px">
      <div class="header">{@render header()}</div>
      {#if banner}
        <div class="banner" bind:offsetHeight={bannerBlockSize}>{@render banner()}</div>
      {/if}
      {@render children()}
    </div>
  </div>
</div>

<style>
  .shell-layout {
    container: app-shell / inline-size;
    min-block-size: 100dvb;
  }

  .shell {
    --shell-rail-width: var(--layout-sidebar);

    display: grid;
    grid-template-columns: var(--shell-rail-width) minmax(0, 1fr);
    transition: grid-template-columns var(--duration-normal) var(--easing-standard);
    min-block-size: 100dvb;
  }

  /* One small control, with the rail's inset on each side. */
  .collapsed {
    --shell-rail-width: calc(var(--control-height-sm) + var(--space-4));
  }

  .rail {
    display: grid;
    position: sticky;
    grid-template-rows: minmax(0, 1fr);
    z-index: var(--layer-sticky);
    transition: inline-size var(--duration-normal) var(--easing-standard);
    box-sizing: border-box;
    inset-block-start: 0;
    padding: var(--space-2);
    inline-size: var(--shell-rail-width);
    block-size: 100dvb;
    overflow: hidden;
  }

  /* The app's lamp lights the navigation where it crosses it, in line with the canvas. */
  .rail,
  .header {
    background: var(--fill-navigation);
  }

  .workspace {
    --shell-header-block-size: calc(var(--control-height-sm) + var(--space-2));
    --shell-sticky-top: var(--shell-banner-block-size);

    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    min-inline-size: 0;
    min-block-size: 100dvb;
  }

  .header {
    display: none;
  }

  .banner {
    position: sticky;
    z-index: var(--layer-sticky);
    inset-block-start: 0;
  }

  @container app-shell (width < 48rem) {
    .shell {
      grid-template-columns: minmax(0, 1fr);
    }

    .rail {
      display: none;
    }

    .workspace {
      --shell-sticky-top: var(--shell-header-block-size);
      --shell-sticky-bottom: var(--shell-banner-block-size);

      padding-block-start: var(--shell-header-block-size);
    }

    /* One control tall, so a phone keeps its height for the page. Fixed to the screen, so iOS stretches the page
       under it past the top while the header and its light stay in place. */
    .header {
      display: grid;
      position: fixed;
      z-index: var(--layer-sticky);
      box-sizing: border-box;
      inset-block-start: 0;
      inset-inline: 0;
      padding-inline: var(--space-2);
      block-size: var(--shell-header-block-size);
    }

    /* The banner waits at the bottom, away from where reading starts, and never covers the page's end. */
    .banner {
      order: 1;
      inset-block-end: 0;
      inset-block-start: auto;
    }
  }

  @media (forced-colors: active) {
    .rail,
    .header {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
