<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
    header?: Snippet;
    navigation?: Snippet;
    aside?: Snippet;
    footer?: Snippet;
    /** Accessible name for the navigation landmark. */
    navigationLabel?: string;
    /** Accessible name for the complementary landmark. */
    asideLabel?: string;
    /** Target used by the default SkipLink. */
    mainId?: string;
  }
</script>

<script lang="ts">
  let {
    header,
    navigation,
    aside,
    footer,
    navigationLabel = "Primary",
    asideLabel = "Context",
    mainId = "main-content",
    class: className = "",
    children,
    ...rest
  }: AppShellProps = $props();
</script>

<div class="shell {className}" {...rest}>
  {#if header}
    <header class="header">{@render header()}</header>
  {/if}
  <div class="body">
    {#if navigation}
      <nav class="navigation" aria-label={navigationLabel}>{@render navigation()}</nav>
    {/if}
    <main id={mainId} class="main">{@render children?.()}</main>
    {#if aside}
      <aside class="aside" aria-label={asideLabel}>{@render aside()}</aside>
    {/if}
  </div>
  {#if footer}
    <footer class="footer">{@render footer()}</footer>
  {/if}
</div>

<style>
  .shell {
    display: flex;
    flex-direction: column;
    gap: var(--layout-island-gap);
    box-sizing: border-box;
    background: var(--color-surface-canvas);
    padding: var(--layout-island-gap);
    min-block-size: 100dvb;
    color: var(--color-text-primary);
  }

  .header,
  .footer,
  .navigation,
  .aside {
    border-radius: var(--radius-lg);
    min-inline-size: 0;
    overflow: clip;
  }

  .header,
  .footer {
    flex: none;
    box-shadow: var(--shadow-sm);
    background: var(--color-surface-island-subtle);
  }

  .body {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "navigation"
      "main"
      "aside";
    flex: 1;
    gap: var(--layout-island-gap);
    min-inline-size: 0;
  }

  .navigation,
  .aside {
    box-sizing: border-box;
    box-shadow: var(--shadow-island);
    background: var(--color-surface-island);
    padding: var(--layout-gutter);
  }

  .navigation {
    grid-area: navigation;
  }
  .aside {
    grid-area: aside;
  }

  .main {
    grid-area: main;
    box-sizing: border-box;
    padding: var(--layout-gutter);
    min-inline-size: 0;
  }

  @media (width >= 48rem) {
    .body {
      grid-template-rows: auto 1fr;
      grid-template-columns: minmax(var(--layout-sidebar-min), var(--layout-sidebar)) minmax(0, 1fr);
      grid-template-areas:
        "navigation main"
        "aside main";
    }
  }

  @media (width >= 72rem) {
    .body {
      grid-template-rows: 1fr;
      grid-template-columns:
        minmax(var(--layout-sidebar-min), var(--layout-sidebar))
        minmax(0, 1fr)
        minmax(var(--layout-sidebar-min), var(--layout-sidebar));
      grid-template-areas: "navigation main aside";
    }
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    .header,
    .footer,
    .navigation,
    .aside {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }
  }

  @media (forced-colors: active) {
    .header,
    .footer,
    .navigation,
    .aside {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
